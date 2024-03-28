//
//  Models.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

struct CreateWebrtcContactResponse: Codable {

    let connectionData: ConnectionData
    let contactId: String
    let participantId: String
    let participantToken: String
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        connectionData = try container.decode(ConnectionData.self, forKey: .connectionData)
        contactId = try container.decode(String.self, forKey: .contactId)
        participantId = try container.decode(String.self, forKey: .participantId)
        participantToken = try container.decode(String.self, forKey: .participantToken)
    }
    
    enum CodingKeys: String, CodingKey {
        case connectionData = "ConnectionData"
        case contactId = "ContactId"
        case participantId = "ParticipantId"
        case participantToken = "ParticipantToken"
    }
}

struct ConnectionData: Codable {
    
    let attendee: AttendeeData
    let meeting: MeetingData
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        attendee = try container.decode(AttendeeData.self, forKey: .attendee)
        meeting = try container.decode(MeetingData.self, forKey: .meeting)
        
    }
    
    enum CodingKeys: String, CodingKey {
        case meeting = "Meeting"
        case attendee = "Attendee"
    }
}

struct AttendeeData: Codable {
    
    let joinToken: String
    let attendeeId: String
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        joinToken = try container.decode(String.self, forKey: .joinToken)
        attendeeId = try container.decode(String.self, forKey: .attendeeId)
    }
    
    enum CodingKeys: String, CodingKey {
        case joinToken = "JoinToken"
        case attendeeId = "AttendeeId"
    }
}

struct MeetingData: Codable {
    
    let mediaRegion: String
    let mediaPlacement: MediaPlacement
    let meetingFeatures: MeetingFeatures
    let meetingId: String
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        mediaRegion = try container.decode(String.self, forKey: .mediaRegion)
        mediaPlacement = try container.decode(MediaPlacement.self,
                                              forKey: .mediaPlacement)
        meetingFeatures = try container.decode(MeetingFeatures.self,
                                               forKey: .meetingFeatures)
        meetingId = try container.decode(String.self, forKey: .meetingId)
    }
    
    enum CodingKeys: String, CodingKey {
        case mediaRegion = "MediaRegion"
        case mediaPlacement = "MediaPlacement"
        case meetingFeatures = "MeetingFeatures"
        case meetingId = "MeetingId"
    }
}

struct MediaPlacement: Codable {
    let audioFallbackUrl: String?
    let audioHostUrl: String?
    let eventIngestionUrl: String?
    let signalingUrl: String?
    let turnControlUrl: String?
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        audioFallbackUrl = try container.decode(String.self, forKey: .audioFallbackUrl)
        audioHostUrl = try container.decode(String.self, forKey: .audioHostUrl)
        eventIngestionUrl = try container.decodeIfPresent(String.self, forKey: .eventIngestionUrl)
        signalingUrl = try container.decode(String.self, forKey: .signalingUrl)
        turnControlUrl = try container.decode(String.self, forKey: .turnControlUrl)
    }
    
    enum CodingKeys: String, CodingKey {
        case audioFallbackUrl = "AudioFallbackUrl"
        case audioHostUrl = "AudioHostUrl"
        case eventIngestionUrl = "EventIngestionUrl"
        case signalingUrl = "SignalingUrl"
        case turnControlUrl = "TurnControlUrl"
    }
}

struct MeetingFeatures: Codable {
    let audio: AudioFeatures?
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        audio = try container.decode(AudioFeatures.self, forKey: .audio)
    }
    
    enum CodingKeys: String, CodingKey {
        case audio = "Audio"
    }
}

struct AudioFeatures: Codable {
    let echoReduction: String?
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        echoReduction = try container.decode(String.self, forKey: .echoReduction)
    }
    
    enum CodingKeys: String, CodingKey {
        case echoReduction = "EchoReduction"
    }
}
