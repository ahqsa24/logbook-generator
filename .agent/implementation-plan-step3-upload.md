# Implementation Plan: Multiple File Upload in Step 3

## Overview
Add ability to upload additional ZIP/Excel files in Step 3 (Review section) to merge with existing entries from Step 2. Users can upload multiple files and all entries will be combined.

## Current Behavior
- **Step 2**: Upload 1 file (ZIP or Excel) → Parse entries → Go to Step 3
- **Step 3**: Review and edit entries, add manual entries one-by-one
- **Limitation**: Cannot bulk-add entries from another file

## Proposed Behavior
- **Step 2**: Upload initial file (unchanged)
- **Step 3**: 
  - Review existing entries
  - **NEW**: Upload additional files (ZIP/Excel) to add more entries
  - **NEW**: Support multiple file uploads
  - **NEW**: Merge all entries together
  - Manual add still available

## User Flow

```
Step 2: Upload File A (50 entries)
  ↓
Step 3: Review 50 entries
  ↓
Upload File B (30 entries) → Now have 80 entries
  ↓
Upload File C (20 entries) → Now have 100 entries
  ↓
Add manual entry → Now have 101 entries
  ↓
Submit all 101 entries
```

## Design Decisions

### 1. **Where to Place Upload UI?**

**Option A: Top Section (Recommended)**
```
┌─────────────────────────────────────────┐
│ Step 3: Review & Submit                 │
├─────────────────────────────────────────┤
│ [Upload Additional Files] 📁            │ ← NEW
│ Drag & drop or click to upload          │
│ Supports: .zip, .xlsx, .xls             │
├─────────────────────────────────────────┤
│ Showing 50 entries                      │
│ [Sort] [Delete All] [Add Entry]         │
│ ... entries list ...                    │
└─────────────────────────────────────────┘
```

**Option B: Next to Action Buttons**
```
┌─────────────────────────────────────────┐
│ Showing 50 entries                      │
│ [Upload File] [Sort] [Delete All] [Add] │ ← NEW
│ ... entries list ...                    │
└─────────────────────────────────────────┘
```

**Recommendation**: **Option A** - More prominent, clear separation from entry management

### 2. **File Upload Behavior**

- ✅ **Multiple files allowed**: Upload File A, then File B, then File C
- ✅ **Merge entries**: All entries combined into one list
- ✅ **Duplicate handling**: 
  - Check for duplicate entries (same date + time + keterangan)
  - Show warning if duplicates found
  - Let user decide: Skip duplicates or Keep all
- ✅ **File tracking**: Track which entries came from which file (for debugging)

### 3. **Entry Source Tracking**

Add `entrySource` field to LogbookEntry:
```typescript
interface LogbookEntry {
  // ... existing fields
  entrySource?: {
    type: 'step2' | 'step3_upload' | 'manual';
    fileName?: string;
    uploadedAt?: string;
  };
}
```

### 4. **UI/UX Enhancements**

**Upload Area:**
- Drag & drop zone
- File type validation
- Progress indicator during parsing
- Success/Error messages
- List of uploaded files with entry counts

**Entry List:**
- Badge showing source (Step 2, File A, File B, Manual)
- Filter by source
- Group by source (optional)

## Implementation Steps

### Phase 1: UI Components

#### 1.1 Create `FileUploadZone` Component
**Location**: `components/Step3Review/components/FileUploadZone.tsx`

```typescript
interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  disabled: boolean;
}
```

**Features**:
- Drag & drop area
- Click to browse
- File type validation (.zip, .xlsx, .xls)
- Visual feedback (hover, drag-over states)
- Loading state during upload

#### 1.2 Create `UploadedFilesList` Component
**Location**: `components/Step3Review/components/UploadedFilesList.tsx`

```typescript
interface UploadedFile {
  name: string;
  entriesCount: number;
  uploadedAt: string;
  status: 'success' | 'error';
}

interface UploadedFilesListProps {
  files: UploadedFile[];
  onRemove?: (fileName: string) => void;
}
```

**Features**:
- List of uploaded files
- Show entry count per file
- Remove file option (removes associated entries)
- Collapsible/expandable

### Phase 2: State Management

#### 2.1 Add State to Step3Review
```typescript
const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
const [isUploadingFile, setIsUploadingFile] = useState(false);
const [uploadError, setUploadError] = useState<string | null>(null);
```

#### 2.2 Add Handler to StepsSection
```typescript
const handleAdditionalFileUpload = async (file: File) => {
  setIsUploadingFile(true);
  try {
    let newEntries: LogbookEntry[];
    
    if (file.name.endsWith('.zip')) {
      const { entries } = await parseZipFile(file);
      newEntries = entries;
    } else {
      newEntries = await parseExcelFile(file);
    }
    
    // Add source tracking
    newEntries = newEntries.map(entry => ({
      ...entry,
      entrySource: {
        type: 'step3_upload',
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    }));
    
    // Check for duplicates
    const duplicates = findDuplicates(entries, newEntries);
    if (duplicates.length > 0) {
      // Show duplicate warning modal
      // Let user choose: skip or keep
    }
    
    // Merge entries
    setEntries([...entries, ...newEntries]);
    
    // Track uploaded file
    setUploadedFiles([...uploadedFiles, {
      name: file.name,
      entriesCount: newEntries.length,
      uploadedAt: new Date().toISOString(),
      status: 'success'
    }]);
    
  } catch (error) {
    setUploadError(error.message);
  } finally {
    setIsUploadingFile(false);
  }
};
```

### Phase 3: Duplicate Detection

#### 3.1 Create Duplicate Checker
**Location**: `lib/duplicateChecker.ts`

```typescript
export interface DuplicateEntry {
  existingIndex: number;
  newEntry: LogbookEntry;
  matchFields: string[];
}

export const findDuplicates = (
  existingEntries: LogbookEntry[],
  newEntries: LogbookEntry[]
): DuplicateEntry[] => {
  const duplicates: DuplicateEntry[] = [];
  
  newEntries.forEach(newEntry => {
    existingEntries.forEach((existing, index) => {
      // Check if duplicate based on:
      // - Same date (Waktu)
      // - Same time range (Tstart, Tend)
      // - Same description (Keterangan)
      if (
        existing.Waktu === newEntry.Waktu &&
        existing.Tstart === newEntry.Tstart &&
        existing.Tend === newEntry.Tend &&
        existing.Keterangan === newEntry.Keterangan
      ) {
        duplicates.push({
          existingIndex: index,
          newEntry,
          matchFields: ['Waktu', 'Tstart', 'Tend', 'Keterangan']
        });
      }
    });
  });
  
  return duplicates;
};
```

#### 3.2 Create Duplicate Warning Modal
**Location**: `components/Step3Review/components/DuplicateWarningModal.tsx`

```typescript
interface DuplicateWarningModalProps {
  isOpen: boolean;
  duplicates: DuplicateEntry[];
  onSkipDuplicates: () => void;
  onKeepAll: () => void;
  onCancel: () => void;
}
```

**Features**:
- Show number of duplicates found
- List duplicate entries
- Options: "Skip Duplicates", "Keep All", "Cancel"

### Phase 4: Entry Source Filtering

#### 4.1 Add Source Filter to SearchFilters
```typescript
// Add to useEntryFilters hook
const [filterSource, setFilterSource] = useState<'all' | 'step2' | 'step3_upload' | 'manual'>('all');

// Filter logic
const filteredBySource = entries.filter(entry => {
  if (filterSource === 'all') return true;
  return entry.entrySource?.type === filterSource;
});
```

#### 4.2 Add Source Badge to EntryCard
```typescript
// In EntryCard component
{entry.entrySource && (
  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
    {entry.entrySource.type === 'step2' ? 'Initial Upload' : 
     entry.entrySource.type === 'step3_upload' ? `From ${entry.entrySource.fileName}` :
     'Manual Entry'}
  </span>
)}
```

### Phase 5: Storage & Persistence

#### 5.1 Update Step3Data Type
```typescript
export interface Step3Data {
  entries: LogbookEntry[];
  uploadedFiles?: UploadedFile[];  // NEW
  results?: SubmissionResult[];
  hasSubmitted: boolean;
  savedAt: string;
}
```

#### 5.2 Save/Load Uploaded Files
```typescript
// Save
saveStep3Data({ 
  entries, 
  uploadedFiles,  // NEW
  results, 
  hasSubmitted 
});

// Load
const step3Data = loadStep3Data();
if (step3Data?.uploadedFiles) {
  setUploadedFiles(step3Data.uploadedFiles);
}
```

## UI Layout Proposal

```tsx
<div className="card">
  <h2>Step 3: Review & Submit</h2>
  
  {/* NEW: File Upload Section */}
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h3>Add More Entries</h3>
    <FileUploadZone 
      onFileUpload={handleAdditionalFileUpload}
      isUploading={isUploadingFile}
      disabled={isSubmitting || hasSubmitted}
    />
    {uploadedFiles.length > 0 && (
      <UploadedFilesList 
        files={uploadedFiles}
        onRemove={handleRemoveUploadedFile}
      />
    )}
  </div>
  
  {/* Existing: Entry Count & Actions */}
  <div className="flex justify-between mb-4">
    <p>Found {entries.length} entries</p>
    <div className="flex gap-2">
      <button>Sort</button>
      <button>Delete All</button>
      <button>Add Entry</button>
    </div>
  </div>
  
  {/* Existing: Search & Filters */}
  <SearchFilters 
    {...existingProps}
    filterSource={filterSource}  // NEW
    setFilterSource={setFilterSource}  // NEW
  />
  
  {/* Existing: Entries List */}
  <div className="entries-list">
    {entries.map((entry, index) => (
      <EntryCard 
        entry={entry}
        showSourceBadge={true}  // NEW
        {...otherProps}
      />
    ))}
  </div>
</div>
```

## Error Handling

1. **Invalid File Type**: Show error message
2. **Parse Error**: Show detailed error with file name
3. **Duplicate Entries**: Show warning modal with options
4. **File Too Large**: Show size limit error
5. **Network Error**: Retry option

## Testing Checklist

- [ ] Upload single additional file
- [ ] Upload multiple additional files
- [ ] Upload ZIP file in Step 3
- [ ] Upload Excel file in Step 3
- [ ] Detect duplicates correctly
- [ ] Skip duplicates works
- [ ] Keep all duplicates works
- [ ] Source badges display correctly
- [ ] Filter by source works
- [ ] Uploaded files list shows correct counts
- [ ] Remove uploaded file removes entries
- [ ] Refresh preserves uploaded files
- [ ] Submit includes all entries from all sources
- [ ] Delete All removes entries from all sources

## Estimated Effort

- **Phase 1 (UI Components)**: 3-4 hours
- **Phase 2 (State Management)**: 2-3 hours
- **Phase 3 (Duplicate Detection)**: 2-3 hours
- **Phase 4 (Filtering)**: 1-2 hours
- **Phase 5 (Storage)**: 1-2 hours
- **Testing & Polish**: 2-3 hours

**Total**: ~12-17 hours

## Benefits

✅ **User Flexibility**: Add entries from multiple sources
✅ **Bulk Operations**: No need to add entries one-by-one
✅ **Better Organization**: Track entry sources
✅ **Duplicate Prevention**: Avoid submitting same entry twice
✅ **Improved UX**: Drag & drop, visual feedback

## Potential Issues & Solutions

| Issue | Solution |
|-------|----------|
| Too many entries (performance) | Virtualized list, pagination |
| Large file upload timeout | Chunked upload, progress bar |
| Memory issues with many files | Limit number of files, file size |
| Confusing duplicate detection | Clear UI, show matched fields |
| Lost data on refresh | Save to localStorage + IndexedDB |

## Alternative Approaches

### Option 1: Simple "Upload More" Button
- Just a button, no drag & drop
- Simpler implementation
- Less visual feedback

### Option 2: Replace Instead of Merge
- Upload new file replaces old entries
- Simpler logic, no duplicates
- Less flexible for users

### Option 3: Separate "Import" Step
- Add Step 2.5 for additional uploads
- More complex flow
- Better separation of concerns

**Recommendation**: Stick with main plan (merge in Step 3) for best UX.
