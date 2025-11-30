import React, { useState, useCallback } from "react";
import { Upload, X, File, Image, FileText, Video, Music } from "lucide-react";
import { cn } from "@/lib/utils";

const FileUpload = ({
  onUpload,
  acceptedTypes = ["image/*", "application/pdf", "text/*"],
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  disabled = false,
  className,
  placeholder = "Файл сонгох эсвэл энд чирэн оруулаарай",
  showPreview = true,
  maxFiles = 5,
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Файлын төрөл тодорхойлох
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/"))
      return <Image className="w-8 h-8 text-blue-500" />;
    if (fileType.startsWith("video/"))
      return <Video className="w-8 h-8 text-purple-500" />;
    if (fileType.startsWith("audio/"))
      return <Music className="w-8 h-8 text-green-500" />;
    if (fileType.includes("pdf"))
      return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  // Файлын хэмжээ форматлах
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Файл валидация
  const validateFile = (file) => {
    const errors = [];

    // Хэмжээ шалгах
    if (file.size > maxSize) {
      errors.push(`Файлын хэмжээ ${formatFileSize(maxSize)}-с их байна`);
    }

    // Төрөл шалгах
    const isValidType = acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });

    if (!isValidType) {
      errors.push("Зөвшөөрөгдөөгүй файлын төрөл");
    }

    return errors;
  };

  // Файл нэмэх
  const handleFiles = useCallback(
    (newFiles) => {
      const fileArray = Array.from(newFiles);
      const validFiles = [];
      const newErrors = [];

      fileArray.forEach((file) => {
        const fileErrors = validateFile(file);
        if (fileErrors.length === 0) {
          validFiles.push({
            file,
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : null,
          });
        } else {
          newErrors.push(`${file.name}: ${fileErrors.join(", ")}`);
        }
      });

      if (multiple) {
        const totalFiles = files.length + validFiles.length;
        if (totalFiles > maxFiles) {
          newErrors.push(`Хамгийн ихдээ ${maxFiles} файл оруулж болно`);
          validFiles.splice(maxFiles - files.length);
        }
        setFiles((prev) => [...prev, ...validFiles]);
      } else {
        setFiles(validFiles.slice(0, 1));
      }

      setErrors(newErrors);
    },
    [files, multiple, maxFiles, maxSize, acceptedTypes]
  );

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || uploading) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [disabled, uploading, handleFiles]
  );

  // Файл сонгох
  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  // Файл устгах
  const removeFile = (fileId) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      // Preview URL-г цэвэрлэх
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  // Upload хийх
  const handleUpload = async () => {
    if (files.length === 0 || !onUpload) return;

    setUploading(true);
    setErrors([]);

    try {
      await onUpload(files.map((f) => f.file));
      setFiles([]);
    } catch (error) {
      setErrors([error.message || "Upload хийхэд алдаа гарлаа"]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Upload зураг */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-gray-400 cursor-pointer",
          "focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center space-y-2">
          <Upload
            className={cn(
              "w-12 h-12",
              dragActive ? "text-blue-500" : "text-gray-400"
            )}
          />
          <p className="text-sm text-gray-600">{placeholder}</p>
          <p className="text-xs text-gray-500">
            {acceptedTypes.join(", ")} • Хамгийн ихдээ {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* Алдааны мэдээлэл */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-600">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </div>
      )}

      {/* Файлуудын жагсаалт */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Сонгогдсон файлууд ({files.length})
          </h4>

          <div className="space-y-2">
            {files.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  {showPreview && fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt={fileObj.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(fileObj.type)
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileObj.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(fileObj.id)}
                  disabled={uploading}
                  className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload товч */}
          {(onUpload || onFileUpload) && (
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className={cn(
                "w-full py-2 px-4 rounded-md font-medium transition-colors",
                "bg-blue-600 text-white hover:bg-blue-700",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {uploading ? "Илгээж байна..." : `${files.length} файл илгээх`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
