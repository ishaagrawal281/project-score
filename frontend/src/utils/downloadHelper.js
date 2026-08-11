export const forceDownload = async (fileUrl, filename) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error("Failed to download file directly, falling back to new tab", error);
    // Fallback to simply opening the URL if fetch fails due to CORS or other errors
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
