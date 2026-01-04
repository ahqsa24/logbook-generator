/**
 * Local types for Step2FileUpload module
 */

export interface Step2FileUploadProps {
    onFileUpload: (file: File) => void;
    onBack: () => void;
    onManualEntry: () => void;
}
