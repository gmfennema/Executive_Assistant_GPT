/**
 * Fetches folder structure with folder names and IDs only.
 * @param {string} folderId - The folder ID.
 * @return {Object} - Folder structure.
 */
function getObsidianVaultStructure(base_obsidian_folder) {
    const folder = DriveApp.getFolderById(base_obsidian_folder);
    function fetchStructure(folder) {
      const subfolders = [];
      const subs = folder.getFolders();
      while (subs.hasNext()) subfolders.push(fetchStructure(subs.next()));
      return { name: folder.getName(), id: folder.getId(), subfolders };
    }
    return fetchStructure(folder);
  }
  
  /**
   * Searches files by name (fuzzy) and returns paths.
   * @param {string} folderId - The folder ID.
   * @param {string} searchTerm - Search term.
   * @return {Array} - Array of file paths or an error message.
   */
  function searchObsidianNotes(folderId, searchTerm) {
    const folder = DriveApp.getFolderById(folderId), results = [];
    function search(folder, path) {
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        if (file.getName().toLowerCase().includes(searchTerm.toLowerCase()))
          results.push({ name: file.getName(), id: file.getId(), path: `${path}/${file.getName()}` });
      }
      const subfolders = folder.getFolders();
      while (subfolders.hasNext()) {
        const subfolder = subfolders.next(); // Fix: store subfolder before recursive call
        search(subfolder, `${path}/${subfolder.getName()}`);
      }
    }
    search(folder, folder.getName());
    return results.length > 0 ? results : [{ error: "No files found matching the search term." }];
  }
  
  /**
   * Retrieves the first 10 files in a folder.
   * @param {string} folderId - The ID of the Google Drive folder.
   * @return {Array} - Array of objects representing the first 10 files.
   */
  function previewObsidianFolder(folderId) {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileList = [];
    
    let count = 0;
    while (files.hasNext() && count < 10) {
      const file = files.next();
      fileList.push({
        name: file.getName(),
        id: file.getId(),
        mimeType: file.getMimeType()
      });
      count++;
    }
    
    return fileList.length > 0 ? fileList : [{ message: "No files found in this folder." }];
  }
  
  /**
   * Creates a new markdown file in a specified Google Drive folder.
   * Replaces any file with the same name in the folder.
   * @param {string} folderId - The ID of the folder where the file should be stored.
   * @param {string} fileName - The name of the markdown file (should end with .md).
   * @param {string} content - The content to be written into the markdown file.
   * @return {Object} - Information about the created file or an error message.
   */
  function createObsidianNote(folderId, fileName, content) {
    try {
      // Validate file extension
      if (!fileName.endsWith('.md')) {
        return { error: "File name must end with '.md'." };
      }
  
      // Get the target folder
      const folder = DriveApp.getFolderById(folderId);
  
      // Check for existing files with the same name and remove them
      const files = folder.getFilesByName(fileName);
      while (files.hasNext()) {
        const existingFile = files.next();
        existingFile.setTrashed(true); // Move the file to the trash
      }
  
      // Create the new markdown file
      const file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
  
      // Return the file details
      return {
        message: "Markdown file created successfully, replacing any existing files with the same name.",
        name: file.getName(),
        id: file.getId(),
        link: file.getUrl()
      };
    } catch (e) {
      return { error: `Failed to create markdown file: ${e.message}` };
    }
  }
  
  /**
   * Reads the contents of a Markdown file from Google Drive.
   * @param {string} fileId - The ID of the Markdown file to read.
   * @return {Object} - The file contents or an error message.
   */
  function readObsidianNote(fileId) {
    try {
      // Get the file by its ID
      const file = DriveApp.getFileById(fileId);
  
      // Check if the file has a .md extension
      if (!file.getName().endsWith('.md')) {
        return { error: "The specified file does not have a .md extension." };
      }
  
      // Read and return the file content
      const content = file.getBlob().getDataAsString();
      return {
        message: "Markdown file content read successfully.",
        name: file.getName(),
        id: fileId,
        content: content
      };
    } catch (e) {
      return { error: `Failed to read Markdown file: ${e.message}` };
    }
  }
  
  /**
   * Creates a new folder in the Obsidian vault.
   * @param {string} parentFolderId - The ID of the parent folder where the new folder should be created.
   * @param {string} folderName - The name of the new folder.
   * @return {Object} - Information about the created folder or an error message.
   */
  function createObsidianFolder(parentFolderId, folderName) {
    try {
      const parentFolder = DriveApp.getFolderById(parentFolderId);
      const newFolder = parentFolder.createFolder(folderName);
      
      return {
        message: "Folder created successfully",
        name: newFolder.getName(),
        id: newFolder.getId()
      };
    } catch (e) {
      return { error: `Failed to create folder: ${e.message}` };
    }
  }
  
  /**
   * Moves a file or folder to a new location in the Obsidian vault.
   * @param {string} itemId - The ID of the file or folder to move.
   * @param {string} destinationFolderId - The ID of the destination folder.
   * @param {boolean} isFolder - Whether the item to move is a folder (true) or file (false).
   * @return {Object} - Status of the move operation.
   */
  function moveObsidianItem(itemId, destinationFolderId, isFolder) {
    try {
      const destinationFolder = DriveApp.getFolderById(destinationFolderId);
      
      if (isFolder) {
        const folderToMove = DriveApp.getFolderById(itemId);
        folderToMove.moveTo(destinationFolder);
        return {
          message: "Folder moved successfully",
          name: folderToMove.getName(),
          id: folderToMove.getId(),
          newParentId: destinationFolderId
        };
      } else {
        const fileToMove = DriveApp.getFileById(itemId);
        fileToMove.moveTo(destinationFolder);
        return {
          message: "File moved successfully",
          name: fileToMove.getName(),
          id: fileToMove.getId(),
          newParentId: destinationFolderId
        };
      }
    } catch (e) {
      return { error: `Failed to move item: ${e.message}` };
    }
  }
  
  /**
   * Deletes a note from the Obsidian vault.
   * @param {string} fileId - The ID of the note to delete.
   * @return {Object} - Status of the deletion operation.
   */
  function deleteObsidianNote(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      
      // Verify it's a markdown file
      if (!file.getName().endsWith('.md')) {
        return { error: "The specified file is not a markdown note." };
      }

      const fileName = file.getName();
      file.setTrashed(true);
      
      return {
        message: "Note deleted successfully",
        name: fileName
      };
    } catch (e) {
      return { error: `Failed to delete note: ${e.message}` };
    }
  }
  