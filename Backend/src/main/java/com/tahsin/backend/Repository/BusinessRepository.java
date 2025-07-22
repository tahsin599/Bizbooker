package com.tahsin.backend.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("SELECT DISTINCT b FROM Business b " +
           "LEFT JOIN FETCH b.locations " +
           "LEFT JOIN FETCH b.serviceCategory " +
           "WHERE b.owner.id = :ownerId")
    List<Business> findByOwnerIdWithDetails(Long ownerId);

        @Query("SELECT DISTINCT b FROM Business b " +
           "LEFT JOIN b.locations l " +
           "WHERE (:categoryId IS NULL OR b.serviceCategory.id = :categoryId) " +
           "AND (:area IS NULL OR l.area = :area)")
    Page<Business> findByServiceCategoryIdAndLocationsArea(
            @Param("categoryId") Long categoryId,
            @Param("area") String area,
            Pageable pageable);

    @Query("SELECT b FROM Business b WHERE b.serviceCategory.id = :categoryId")
    Page<Business> findByServiceCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT DISTINCT b FROM Business b LEFT JOIN b.locations l WHERE l.area = :area")
    Page<Business> findByLocationsArea(@Param("area") String area, Pageable pageable);

    @Query(value = "SELECT * FROM business ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Business> findRandomBusinesses(@Param("count") int count);

    @Query("SELECT b FROM Business b WHERE LOWER(b.businessName) = LOWER(:name)")
    Business findByBusinessNameIgnoreCase(@Param("name") String name);
   
    
}
