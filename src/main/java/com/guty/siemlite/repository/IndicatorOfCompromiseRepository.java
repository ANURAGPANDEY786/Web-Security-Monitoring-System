package com.guty.siemlite.repository;

import com.guty.siemlite.model.IndicatorOfCompromise;
import com.guty.siemlite.model.IocType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for managing Indicators of Compromise.
 */
public interface IndicatorOfCompromiseRepository extends JpaRepository<IndicatorOfCompromise, Long> {

    Optional<IndicatorOfCompromise> findByValue(String value);
    List<IndicatorOfCompromise> findByOwnerUsername(String ownerUsername);

java.util.Optional<IndicatorOfCompromise> findByIdAndOwnerUsername(
        Long id, String ownerUsername);

java.util.Optional<IndicatorOfCompromise> findByValueAndOwnerUsername(
        String value, String ownerUsername);

    boolean existsByValue(String value);

    List<IndicatorOfCompromise> findByActive(boolean active);

    List<IndicatorOfCompromise> findByTypeAndActive(IocType type, boolean active);

    Optional<IndicatorOfCompromise> findByValueAndTypeAndActiveTrue(String value, IocType type);
}
