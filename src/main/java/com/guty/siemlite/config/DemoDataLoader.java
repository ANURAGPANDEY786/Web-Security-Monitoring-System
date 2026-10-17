package com.guty.siemlite.config;

import com.guty.siemlite.model.IndicatorOfCompromise;
import com.guty.siemlite.model.IocType;
import com.guty.siemlite.repository.IndicatorOfCompromiseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private final IndicatorOfCompromiseRepository iocRepository;

    public DemoDataLoader(IndicatorOfCompromiseRepository iocRepository) {
        this.iocRepository = iocRepository;
    }

    @Override
    public void run(String... args) {
        seedIoc("192.168.1.200", IocType.IP, "SIEM-Lite Demo Threat Feed", 95,
                "Cobalt Strike", "SIEM-Lite Demo",
                "Known command and control IP used to demonstrate IOC-based alerting.");

        seedIoc("45.77.10.15", IocType.IP, "SIEM-Lite Demo Threat Feed", 88,
                "Mirai", "Botnet Campaign",
                "Known botnet command and control source used for demo detection.");

        seedIoc("203.0.113.50", IocType.IP, "SIEM-Lite Demo Threat Feed", 85,
                "Unknown", "Password Spray Campaign",
                "Known source of password spraying and brute force activity.");

        seedIoc("198.51.100.25", IocType.IP, "SIEM-Lite Demo Threat Feed", 90,
                "QakBot", "Initial Access Campaign",
                "Known malware distribution infrastructure.");
    }

    private void seedIoc(
            String value,
            IocType type,
            String threatSource,
            Integer confidence,
            String malwareFamily,
            String campaign,
            String description
    ) {
        if (iocRepository.findByValue(value).isPresent()) {
            return;
        }

        IndicatorOfCompromise ioc = new IndicatorOfCompromise();
        ioc.setValue(value);
        ioc.setType(type);
        ioc.setThreatSource(threatSource);
        ioc.setConfidence(confidence);
        ioc.setMalwareFamily(malwareFamily);
        ioc.setCampaign(campaign);
        ioc.setDescription(description);
        ioc.setActive(true);

        iocRepository.save(ioc);
    }
}
