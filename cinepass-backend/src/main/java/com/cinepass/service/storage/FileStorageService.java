package com.cinepass.service.storage;

public interface FileStorageService {
    String storeFile(byte[] content, String fileName, String subDirectory);
    byte[] retrieveFile(String filePath);
}
