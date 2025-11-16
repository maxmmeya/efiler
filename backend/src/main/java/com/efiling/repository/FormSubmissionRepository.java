package com.efiling.repository;

import com.efiling.domain.entity.FormSubmission;
import com.efiling.domain.entity.Institution;
import com.efiling.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long>, JpaSpecificationExecutor<FormSubmission> {
    Optional<FormSubmission> findBySubmissionNumber(String submissionNumber);
    List<FormSubmission> findBySubmittedBy(User user);
    List<FormSubmission> findByStatus(FormSubmission.SubmissionStatus status);

    @Query("SELECT fs FROM FormSubmission fs WHERE fs.submittedBy.institution = :institution " +
           "AND fs.visibleToInstitution = true")
    List<FormSubmission> findInstitutionalSubmissions(@Param("institution") Institution institution);

    @Query("SELECT fs FROM FormSubmission fs WHERE " +
           "(fs.submittedBy = :user) OR " +
           "(fs.submittedBy.institution = :institution AND fs.visibleToInstitution = true)")
    List<FormSubmission> findAccessibleSubmissionsByUser(@Param("user") User user, @Param("institution") Institution institution);
}
