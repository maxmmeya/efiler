package com.efiling.service;

import com.efiling.domain.entity.Institution;
import com.efiling.repository.InstitutionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InstitutionService {

    private final InstitutionRepository institutionRepository;

    @Transactional
    public Institution createInstitution(String code, String name, String institutionType,
                                          String description, String contactEmail,
                                          String contactPhone, String address) {
        if (institutionRepository.existsByCode(code)) {
            throw new RuntimeException("Institution with this code already exists");
        }

        Institution institution = Institution.builder()
                .code(code)
                .name(name)
                .institutionType(institutionType)
                .description(description)
                .contactEmail(contactEmail)
                .contactPhone(contactPhone)
                .address(address)
                .isActive(true)
                .build();

        return institutionRepository.save(institution);
    }

    public Institution getInstitution(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
    }

    public Institution getInstitutionByCode(String code) {
        return institutionRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Institution not found"));
    }

    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    @Transactional
    public Institution updateInstitution(Long id, String name, String institutionType,
                                          String description, String contactEmail,
                                          String contactPhone, String address) {
        Institution institution = getInstitution(id);

        institution.setName(name);
        institution.setInstitutionType(institutionType);
        institution.setDescription(description);
        institution.setContactEmail(contactEmail);
        institution.setContactPhone(contactPhone);
        institution.setAddress(address);

        return institutionRepository.save(institution);
    }

    @Transactional
    public void deactivateInstitution(Long id) {
        Institution institution = getInstitution(id);
        institution.setIsActive(false);
        institutionRepository.save(institution);
    }
}
