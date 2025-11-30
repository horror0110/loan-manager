"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, FileText, Maximize, Download, ExternalLink } from "lucide-react";

const FileViewer = ({ isOpen, onClose, file, fileUrl }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const getFileType = (filename) => {
    if (!filename) return "unknown";

    const parts = filename.split(".");
    if (parts.length < 2) return "unknown";

    let extension = parts[parts.length - 1].toLowerCase();
    extension = extension.replace(/[()\s\d]+$/, "");

    return extension || "unknown";
  };

  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setPdfError(false);
    } else if (file) {
      // Auto-fullscreen for PDF, video, and audio files
      const filename = file.filename || file.name;
      const extension = getFileType(filename);
      const videoTypes = ["mp4", "avi", "mov", "wmv", "webm", "mkv"];
      const audioTypes = ["mp3", "wav", "flac", "ogg", "aac", "m4a"];

      if (
        extension === "pdf" ||
        file.type === "pdf" ||
        videoTypes.includes(extension) ||
        videoTypes.includes(file.type) ||
        audioTypes.includes(extension) ||
        audioTypes.includes(file.type)
      ) {
        setIsFullscreen(true);
      }
    }
  }, [isOpen, file]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        onClose();
      }
    };

    if (isOpen && isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isFullscreen, onClose]);

  if (!file || !isOpen) return null;

  const getFileIcon = (filename) => {
    const extension = getFileType(filename);
    const iconClass = "w-8 h-8";

    switch (extension) {
      case "pdf":
        return <FileText className={`${iconClass} text-red-500`} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "svg":
      case "bmp":
        return <FileText className={`${iconClass} text-blue-500`} />;
      case "doc":
      case "docx":
        return <FileText className={`${iconClass} text-blue-600`} />;
      case "xls":
      case "xlsx":
        return <FileText className={`${iconClass} text-green-600`} />;
      case "ppt":
      case "pptx":
        return <FileText className={`${iconClass} text-orange-600`} />;
      case "txt":
      case "md":
        return <FileText className={`${iconClass} text-gray-500`} />;
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return <FileText className={`${iconClass} text-purple-500`} />;
      case "mp3":
      case "wav":
      case "flac":
        return <FileText className={`${iconClass} text-green-500`} />;
      case "zip":
      case "rar":
      case "7z":
        return <FileText className={`${iconClass} text-yellow-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-400`} />;
    }
  };

  const isImage = (filename, fileType) => {
    const extension = getFileType(filename);
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    return imageTypes.includes(extension) || imageTypes.includes(fileType);
  };

  const isPdf = (filename, fileType) => {
    const extension = getFileType(filename);
    return extension === "pdf" || fileType === "pdf";
  };

  const isVideo = (filename, fileType) => {
    const extension = getFileType(filename);
    const videoTypes = ["mp4", "avi", "mov", "wmv", "webm", "mkv"];
    return videoTypes.includes(extension) || videoTypes.includes(fileType);
  };

  const isAudio = (filename, fileType) => {
    const extension = getFileType(filename);
    const audioTypes = ["mp3", "wav", "flac", "ogg", "aac", "m4a"];
    return audioTypes.includes(extension) || audioTypes.includes(fileType);
  };

  const isTextFile = (filename, fileType) => {
    const extension = getFileType(filename);
    const textTypes = [
      "txt",
      "md",
      "json",
      "xml",
      "csv",
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
    ];
    return textTypes.includes(extension) || textTypes.includes(fileType);
  };

  const isDocument = (filename, fileType) => {
    const extension = getFileType(filename);
    const docTypes = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
    return docTypes.includes(extension) || docTypes.includes(fileType);
  };

  const filename = file.filename || file.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isPdf(filename, file.type) && isFullscreen
            ? "max-w-full w-full h-full p-0"
            : "max-h-[90vh] w-[95vh]"
        }`}
      >
        <DialogHeader
          className={
            isFullscreen
              ? "sr-only"
              : "flex flex-row items-center justify-between"
          }
        >
          <DialogTitle
            className={isFullscreen ? "sr-only" : "flex items-center gap-2"}
          >
            {isFullscreen ? (
              <span>PDF Viewer</span>
            ) : (
              <>
                {getFileIcon(file.filename || file.name)}
                <span className="truncate">
                  {file.filename || file.name || "Unknown File"}
                </span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className={`flex-1 overflow-auto ${isFullscreen ? "" : ""}`}>
          {isImage(filename, file.type) ? (
            <div
              className={`${
                isFullscreen
                  ? "fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                  : "flex justify-center items-center min-h-[600px]"
              } relative`}
            >
              <img
                src={fileUrl}
                alt={file.filename || file.name}
                className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${
                  isFullscreen ? "w-full h-full object-contain" : ""
                }`}
                style={{
                  maxWidth: isFullscreen ? "100%" : "100%",
                  maxHeight: isFullscreen ? "100vh" : "80vh",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />

              <div className="hidden flex-col items-center justify-center min-h-[600px] text-gray-500">
                <FileText className="w-16 h-16 mb-4" />
                <p>Зураг ачаалах боломжгүй</p>
              </div>

              {/* Fullscreen controls for images */}
              <div
                className={`absolute ${
                  isFullscreen ? "top-4 right-4" : "bottom-4 right-4"
                } flex gap-2 z-[10000]`}
              >
                {!isFullscreen && (
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Томруулах
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.download = file.filename || file.name || "image";
                    link.click();
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Татах
                </Button>
                {isFullscreen && (
                  <Button
                    onClick={() => {
                      setIsFullscreen(false);
                      onClose();
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Хаах
                  </Button>
                )}
              </div>
            </div>
          ) : isPdf(filename, file.type) ? (
            <div
              className={`${
                isFullscreen
                  ? "fixed inset-0 z-[9999] bg-black"
                  : "w-full h-[70vh]"
              } relative flex flex-col`}
            >
              {!pdfError ? (
                <>
                  <embed
                    src={fileUrl}
                    type="application/pdf"
                    className={`${
                      isFullscreen ? "w-full h-full" : "w-full flex-1"
                    } border-0 ${isFullscreen ? "" : "rounded-lg"} bg-white`}
                    title={file.filename || file.name}
                  />
                  <div
                    className={`absolute ${
                      isFullscreen ? "top-4 right-4" : "bottom-4 right-4"
                    } flex gap-2 z-[10000]`}
                  >
                    {!isFullscreen && (
                      <Button
                        onClick={() => setIsFullscreen(true)}
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                      >
                        <Maximize className="w-4 h-4 mr-2" />
                        Томруулах
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = fileUrl;
                        link.download =
                          file.filename || file.name || "document.pdf";
                        link.click();
                      }}
                      size="sm"
                      variant="outline"
                      className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Татах
                    </Button>
                    {isFullscreen && (
                      <Button
                        onClick={() => {
                          setIsFullscreen(false);
                          onClose();
                        }}
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur shadow-md hover:bg-white flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Хаах
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8">
                  <FileText className="w-16 h-16 mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    PDF файл харах боломжгүй
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Браузер PDF-г шууд харуулж чадахгүй байна
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => window.open(fileUrl, "_blank")}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Браузерт нээх
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = fileUrl;
                        link.download =
                          file.filename || file.name || "document.pdf";
                        link.click();
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Татаж авах
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : isVideo(filename, file.type) ? (
            <div
              className={`${
                isFullscreen
                  ? "fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                  : "w-full h-[60vh] flex justify-center items-center"
              } relative`}
            >
              <video
                src={fileUrl}
                controls
                className={`max-w-full max-h-full rounded-lg shadow-lg ${
                  isFullscreen ? "w-full h-full" : ""
                }`}
                style={{
                  maxWidth: isFullscreen ? "100%" : "100%",
                  maxHeight: isFullscreen ? "100vh" : "60vh",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              >
                Таны браузер видео файлыг дэмжихгүй байна.
              </video>
              <div className="hidden flex-col items-center justify-center h-full text-gray-500">
                <FileText className="w-16 h-16 mb-4" />
                <p>Видео файл ачаалах боломжгүй</p>
              </div>

              {/* Fullscreen controls for videos */}
              <div
                className={`absolute ${
                  isFullscreen ? "top-4 right-4" : "bottom-4 right-4"
                } flex gap-2 z-[10000]`}
              >
                {!isFullscreen && (
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Томруулах
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.download = file.filename || file.name || "video";
                    link.click();
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Татах
                </Button>
                {isFullscreen && (
                  <Button
                    onClick={() => {
                      setIsFullscreen(false);
                      onClose();
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Хаах
                  </Button>
                )}
              </div>
            </div>
          ) : isAudio(filename, file.type) ? (
            <div
              className={`${
                isFullscreen
                  ? "fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                  : "flex flex-col items-center justify-center min-h-[400px]"
              } text-gray-500 relative`}
            >
              <FileText className="w-16 h-16 mb-4 text-green-500" />
              <p className="text-lg font-medium mb-4">
                {file.filename || file.name || "Unknown File"}
              </p>
              <audio
                src={fileUrl}
                controls
                className={`w-full max-w-md mb-4 ${
                  isFullscreen ? "max-w-2xl" : ""
                }`}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              >
                Таны браузер аудио файлыг дэмжихгүй байна.
              </audio>
              <div className="hidden flex-col items-center justify-center text-gray-500">
                <p>Аудио файл ачаалах боломжгүй</p>
              </div>

              {/* Fullscreen controls for audio */}
              <div
                className={`absolute ${
                  isFullscreen ? "top-4 right-4" : "bottom-4 right-4"
                } flex gap-2 z-[10000]`}
              >
                {!isFullscreen && (
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Томруулах
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.download = file.filename || file.name || "audio";
                    link.click();
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Татах
                </Button>
                {isFullscreen && (
                  <Button
                    onClick={() => {
                      setIsFullscreen(false);
                      onClose();
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Хаах
                  </Button>
                )}
              </div>
            </div>
          ) : isTextFile(filename, file.type) ? (
            <div
              className={`${
                isFullscreen
                  ? "fixed inset-0 z-[9999] bg-white"
                  : "w-full h-[70vh]"
              } relative`}
            >
              <iframe
                src={fileUrl}
                className={`w-full h-full border-0 rounded-lg ${
                  isFullscreen ? "h-screen" : ""
                }`}
                title={file.filename || file.name}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden flex-col items-center justify-center h-full text-gray-500">
                <FileText className="w-16 h-16 mb-4" />
                <p>Текст файл ачаалах боломжгүй</p>
              </div>

              {/* Fullscreen controls for text files */}
              <div
                className={`absolute ${
                  isFullscreen ? "top-4 right-4" : "bottom-4 right-4"
                } flex gap-2 z-[10000]`}
              >
                {!isFullscreen && (
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Томруулах
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.download = file.filename || file.name || "text";
                    link.click();
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Татах
                </Button>
                {isFullscreen && (
                  <Button
                    onClick={() => {
                      setIsFullscreen(false);
                      onClose();
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Хаах
                  </Button>
                )}
              </div>
            </div>
          ) : isDocument(filename, file.type) ? (
            <div
              className={`${
                isFullscreen
                  ? "fixed inset-0 z-[9999] bg-white"
                  : "w-full h-[80vh]"
              } relative`}
            >
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                  fileUrl
                )}&embedded=true`}
                className={`w-full h-full border-0 rounded-lg ${
                  isFullscreen ? "h-screen" : ""
                }`}
                title={file.filename || file.name}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />

              <div className="hidden flex-col items-center justify-center h-full text-gray-500">
                <FileText className="w-16 h-16 mb-4" />
                <p className="mb-4">Документ файл ачаалах боломжгүй</p>
                <div className="flex gap-4">
                  <Button
                    onClick={() =>
                      window.open(
                        `https://docs.google.com/gview?url=${encodeURIComponent(
                          fileUrl
                        )}&embedded=false`,
                        "_blank"
                      )
                    }
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Google Docs-д нээх
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = fileUrl;
                      link.download = file.filename || file.name;
                      link.click();
                    }}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Татах
                  </Button>
                </div>
              </div>

              {/* Fullscreen controls for documents */}
              <div
                className={`absolute ${
                  isFullscreen ? "top-4 right-4" : "bottom-4 right-4"
                } flex gap-2 z-[10000]`}
              >
                {!isFullscreen && (
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Томруулах
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.download = file.filename || file.name || "document";
                    link.click();
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Татах
                </Button>
                {isFullscreen && (
                  <Button
                    onClick={() => {
                      setIsFullscreen(false);
                      onClose();
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Хаах
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`${
                isFullscreen
                  ? "fixed inset-0 z-[9999] bg-white flex items-center justify-center"
                  : "flex flex-col items-center justify-center min-h-[400px]"
              } text-gray-500 relative`}
            >
              {getFileIcon(file.filename || file.name)}
              <p className="mt-4 text-lg font-medium">
                {file.filename || file.name || "Unknown File"}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Энэ файлын төрлийг шууд харах боломжгүй
              </p>

              {/* Fullscreen controls for unknown files */}
              <div
                className={`absolute ${
                  isFullscreen ? "top-4 right-4" : "bottom-4 right-4"
                } flex gap-2 z-[10000]`}
              >
                {!isFullscreen && (
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Томруулах
                  </Button>
                )}
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.download = file.filename || file.name || "file";
                    link.click();
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Татах
                </Button>
                {isFullscreen && (
                  <Button
                    onClick={() => {
                      setIsFullscreen(false);
                      onClose();
                    }}
                    size="sm"
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Хаах
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewer;
