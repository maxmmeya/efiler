package com.efiling.repository;

import com.efiling.domain.entity.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    Optional<Form> findByFormCode(String formCode);
    List<Form> findByIsActive(Boolean isActive);
}
