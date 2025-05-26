package com.tahsin.backend.Repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.User;


@Repository
@Component
public interface UserRepository extends JpaRepository<User,Integer> {
    
   
    User findByUsername(String username);

}
