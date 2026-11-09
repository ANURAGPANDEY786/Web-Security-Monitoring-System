package com.guty.siemlite.security.dto;

public class UpdateUserStatusRequest {

    private boolean enabled;

    public UpdateUserStatusRequest() {
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}