package com.efiling.controller;

import com.efiling.domain.entity.Institution;
import com.efiling.service.InstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    @GetMapping
    public ResponseEntity<List<Institution>> getAllInstitutions() {
        return ResponseEntity.ok(institutionService.getAllInstitutions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Institution> getInstitution(@PathVariable Long id) {
        return ResponseEntity.ok(institutionService.getInstitution(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Institution> getInstitutionByCode(@PathVariable String code) {
        return ResponseEntity.ok(institutionService.getInstitutionByCode(code));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> createInstitution(@RequestBody Map<String, Object> institutionData) {
        try {
            Institution institution = institutionService.createInstitution(
                    (String) institutionData.get("code"),
                    (String) institutionData.get("name"),
                    (String) institutionData.get("institutionType"),
                    (String) institutionData.get("description"),
                    (String) institutionData.get("contactEmail"),
                    (String) institutionData.get("contactPhone"),
                    (String) institutionData.get("address")
            );

            return ResponseEntity.ok(institution);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> updateInstitution(
            @PathVariable Long id,
            @RequestBody Map<String, Object> institutionData) {
        try {
            Institution institution = institutionService.updateInstitution(
                    id,
                    (String) institutionData.get("name"),
                    (String) institutionData.get("institutionType"),
                    (String) institutionData.get("description"),
                    (String) institutionData.get("contactEmail"),
                    (String) institutionData.get("contactPhone"),
                    (String) institutionData.get("address")
            );

            return ResponseEntity.ok(institution);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> deactivateInstitution(@PathVariable Long id) {
        try {
            institutionService.deactivateInstitution(id);
            return ResponseEntity.ok("Institution deactivated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
