package com.gamefy.gamefy_back.controller;

import com.gamefy.gamefy_back.dto.CreateUserDto;
import com.gamefy.gamefy_back.dto.UserResponseDto;
import com.gamefy.gamefy_back.dto.UpdateProfileDto;
import com.gamefy.gamefy_back.model.User;
import com.gamefy.gamefy_back.service.UserService;
import com.gamefy.gamefy_back.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.List;
import java.net.MalformedURLException;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/gamefy/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;
    private final FileService fileService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody CreateUserDto request) {
        return ResponseEntity.ok(service.createUser(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        service.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'WEB_MASTER')")
    public ResponseEntity<UserResponseDto> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean enabled) {
        UserResponseDto updatedUser = service.updateUserStatus(id, enabled);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponseDto> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileDto request) {
        return ResponseEntity.ok(service.updateProfile(user.getId(), request));
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<UserResponseDto> uploadProfilePhoto(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) throws IOException {
        String fileName = fileService.saveProfilePhoto(file);
        
        // Update user profile photo path to use the new serving endpoint
        UpdateProfileDto dto = new UpdateProfileDto();
        dto.setProfilePhoto("/gamefy/users/profile/photo/" + fileName);
        UserResponseDto updatedUser = service.updateProfile(user.getId(), dto);
        
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/profile/photo/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            Path file = Paths.get("uploads/profile_photos").resolve(fileName);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = "image/jpeg"; // Default
                if (fileName.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
