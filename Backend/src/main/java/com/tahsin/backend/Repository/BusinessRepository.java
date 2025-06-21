package com.tahsin.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.User;

@Repository
@Component
public interface BusinessRepository extends JpaRepository<Business, Long> {
    List<Business> findByOwner(User owner);
    List<Business> findByIsApproved(boolean isApproved);
    
   /*  @Query("SELECT b FROM Business b WHERE " +
           "LOWER(b.businessName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Business> searchBusinesses(@Param("query") String query);*/
    
    @Query("SELECT DISTINCT b FROM Business b JOIN b.services s WHERE s.name = :serviceName")
    List<Business> findByServiceName(@Param("serviceName") String serviceName);
    boolean existsByBusinessName(String businessName);
}
