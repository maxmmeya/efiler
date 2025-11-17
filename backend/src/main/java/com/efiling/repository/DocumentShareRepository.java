package com.efiling.repository;

import com.efiling.domain.entity.Document;
import com.efiling.domain.entity.DocumentShare;
import com.efiling.domain.entity.Institution;
import com.efiling.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentShareRepository extends JpaRepository<DocumentShare, Long> {

    List<DocumentShare> findByDocument(Document document);

    List<DocumentShare> findBySharedBy(User sharedBy);

    @Query("SELECT ds FROM DocumentShare ds WHERE " +
           "(ds.shareType = 'USER' AND ds.sharedWithUser = :user) OR " +
           "(ds.shareType = 'INSTITUTION' AND ds.sharedWithInstitution = :institution) OR " +
           "(ds.shareType = 'ALL_USERS' AND ds.shareAllUsers = true) " +
           "AND ds.isActive = true")
    List<DocumentShare> findSharedDocumentsForUser(@Param("user") User user, @Param("institution") Institution institution);

    boolean existsByDocumentAndSharedWithUser(Document document, User user);

    boolean existsByDocumentAndShareAllUsersTrue(Document document);
}
