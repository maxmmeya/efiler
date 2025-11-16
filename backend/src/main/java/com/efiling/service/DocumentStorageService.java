package com.efiling.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Slf4j
public class DocumentStorageService {

    @Value("${app.storage.type}")
    private String storageType;

    @Value("${app.storage.local.path}")
    private String localStoragePath;

    public String storeFile(MultipartFile file, String documentType) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";

        // Generate unique filename
        String filename = UUID.randomUUID().toString() + extension;

        // Create directory structure: uploads/documentType/yyyy/MM/dd/
        String datePath = LocalDate.now().toString().replace("-", "/");
        String relativePath = documentType + "/" + datePath + "/" + filename;

        if ("local".equals(storageType)) {
            return storeFileLocally(file, relativePath);
        } else {
            // S3 storage would be implemented here
            throw new UnsupportedOperationException("S3 storage not yet implemented");
        }
    }

    private String storeFileLocally(MultipartFile file, String relativePath) throws IOException {
        Path targetLocation = Paths.get(localStoragePath).resolve(relativePath);
        Files.createDirectories(targetLocation.getParent());

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        }

        return relativePath;
    }

    public File getFile(String filePath) throws IOException {
        if ("local".equals(storageType)) {
            Path path = Paths.get(localStoragePath).resolve(filePath);
            if (Files.exists(path)) {
                return path.toFile();
            }
            throw new IOException("File not found: " + filePath);
        } else {
            throw new UnsupportedOperationException("S3 storage not yet implemented");
        }
    }

    public void deleteFile(String filePath) throws IOException {
        if ("local".equals(storageType)) {
            Path path = Paths.get(localStoragePath).resolve(filePath);
            Files.deleteIfExists(path);
        } else {
            throw new UnsupportedOperationException("S3 storage not yet implemented");
        }
    }

    public String calculateChecksum(MultipartFile file) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(file.getBytes());
        StringBuilder hexString = new StringBuilder();
        for (byte b : digest) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }
}
