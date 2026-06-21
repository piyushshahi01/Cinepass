package com.cinepass.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class LocalFileStorageService implements FileStorageService {

    private static final String BASE_DIR = "./tickets";

    @Override
    public String storeFile(byte[] content, String fileName, String subDirectory) {
        try {
            Path targetLocation = Paths.get(BASE_DIR, subDirectory).toAbsolutePath().normalize();
            Files.createDirectories(targetLocation);

            Path filePath = targetLocation.resolve(fileName);
            Files.write(filePath, content);
            
            // Return relative path to save in DB
            return Paths.get(BASE_DIR, subDirectory, fileName).toString().replace("\\", "/");
        } catch (IOException ex) {
            log.error("Could not store file " + fileName + ". Please try again!", ex);
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    @Override
    public byte[] retrieveFile(String filePath) {
        try {
            Path path = Paths.get(filePath).toAbsolutePath().normalize();
            return Files.readAllBytes(path);
        } catch (IOException ex) {
            log.error("Could not read file " + filePath, ex);
            throw new RuntimeException("Could not read file " + filePath, ex);
        }
    }
}
