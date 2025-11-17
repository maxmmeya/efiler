package com.efiling.repository;

import com.efiling.domain.entity.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {

    Optional<DocumentType> findByCode(String code);

    List<DocumentType> findByIsActiveTrue();

    boolean existsByCode(String code);

    boolean existsByName(String name);

    @Query("SELECT dt FROM DocumentType dt LEFT JOIN FETCH dt.checklistItems WHERE dt.id = :id")
    Optional<DocumentType> findByIdWithChecklistItems(Long id);
}
