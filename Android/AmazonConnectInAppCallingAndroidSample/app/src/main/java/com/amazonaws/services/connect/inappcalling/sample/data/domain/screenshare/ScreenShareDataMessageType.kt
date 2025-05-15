package com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare

// The data message sent through channel `AMAZON_CONNECT_SCREEN_SHARING` for updating the
// screen share capability
enum class ScreenShareDataMessageType(val value: String) {
    // Data message for screen share capability is enabled
    STARTED("ScreenSharingStarted"),

    // Data message for screen share capability is disabled
    STOPPED("ScreenSharingStopped");

    companion object {
        fun fromString(value: String): ScreenShareDataMessageType? {
            return values().find { it.value.equals(value, ignoreCase = true) }
        }
    }
}
