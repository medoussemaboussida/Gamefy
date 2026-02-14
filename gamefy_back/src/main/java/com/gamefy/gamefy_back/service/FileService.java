package com.gamefy.gamefy_back.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    private final String uploadDir = "uploads/profile_photos";
    private final List<String> allowedExtensions = Arrays.asList("png", "jpg", "jpeg");

    public String saveProfilePhoto(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Invalid filename");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!allowedExtensions.contains(extension)) {
            throw new RuntimeException("Only PNG, JPG, and JPEG formats are allowed");
        }

        // Create directory if it doesn't exist
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }

        // Generate unique filename
        String uniqueFileName = UUID.randomUUID().toString() + "." + extension;
        Path filePath = path.resolve(uniqueFileName);

        // Copy file to target location
        Files.copy(file.getInputStream(), filePath);

        return uniqueFileName;
    }
}
