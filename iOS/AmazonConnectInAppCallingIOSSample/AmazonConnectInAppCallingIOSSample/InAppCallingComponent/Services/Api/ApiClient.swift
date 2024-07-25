//
//  ApiClient.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

// TODO: remove
struct CreateMeetingResponse: Codable {

    let joinInfo: JoinInfoData
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        joinInfo = try container.decode(JoinInfoData.self, forKey: .joinInfo)
    }
    
    enum CodingKeys: String, CodingKey {
        case joinInfo = "JoinInfo"
    }
}

// TODO: remove
struct JoinInfoData: Codable {
    
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

// TODO: remove
struct JoinInfoMeetingData: Codable {
    
    let meeting: MeetingData
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        meeting = try container.decode(MeetingData.self, forKey: .meeting)
        
    }
    
    enum CodingKeys: String, CodingKey {
        case meeting = "Meeting"
    }
}

// TODO: remove
struct JoinInfoAttendeeData: Codable {
    
    let attendee: AttendeeData
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        attendee = try container.decode(AttendeeData.self, forKey: .attendee)
        
    }
    
    enum CodingKeys: String, CodingKey {
        case attendee = "Attendee"
    }
}

class ApiClient {
    
    private let config: InAppCallingConfiguration
    private let httpClient: HttpClient
    
    init(config: InAppCallingConfiguration,
         httpClient: HttpClient) {
        self.config = config
        self.httpClient = httpClient
    }
    
    
    // TODO: remove
    func createWebrtcContact(connectInstanceId: String,
                             contactFlowId: String,
                             displayName: String,
                             attributes: [String: String],
                             onSuccess: @escaping (_ response: CreateWebrtcContactResponse) -> Void,
                             onFailure: @escaping (_ error: Error) -> Void) {
        let url = "https://4w5z5lp6f3.execute-api.us-east-1.amazonaws.com/Prod/join"
        let payload = [
            "attendeeName": "george",
            "title": "screenshare16",
            "region": "us-west-2"
        ]
        
        self.httpClient.postJson(url, nil, payload) { data in
            let meetingInfo: CreateMeetingResponse = data
            
            let response = CreateWebrtcContactResponse(meetingData: meetingInfo.joinInfo.meeting,
                                                       attendeeData: meetingInfo.joinInfo.attendee,
                                                       contactId: "", participantId: "", participantToken: "")
            onSuccess(response)
        } _: { error in
            onFailure(error)
        }


    }
    
//    func createWebrtcContact(connectInstanceId: String,
//                             contactFlowId: String,
//                             displayName: String,
//                             attributes: [String: String],
//                             onSuccess: @escaping (_ response: CreateWebrtcContactResponse) -> Void,
//                             onFailure: @escaping (_ error: Error) -> Void) {
//        let url = self.config.startWebrtcContactEndpoint
//        let body = CreateWebrtcContactRequest(connectInstanceId: connectInstanceId,
//                                              contactFlowId: contactFlowId,
//                                              displayName: displayName,
//                                              attributes: attributes)
//        self.httpClient.postJson(url, nil, body) { data in
//            onSuccess(data)
//        } _: { error in
//            onFailure(error)
//        }
//    }
    
    func createParticipantConnection(participantToken: String,
                                     onSuccess: @escaping (_ response: CreateParticipantConnectionResponse) -> Void,
                                     onFailure: @escaping (_ error: Error) -> Void) {
        let url = self.config.createParticipantConnectionEndpoint
        let body = ["ParticipantToken": participantToken]
        self.httpClient.postJson(url, nil, body) { data in
            onSuccess(data)
        } _: { error in
            onFailure(error)
        }
    }
    
    func sendMessage(connectionToken: String,
                     digits: String,
                     onSuccess: @escaping () -> Void,
                     onFailure: @escaping (_ error: Error) -> Void) {
        let url = self.config.sendMessageEndpoint
        let body = [
            "ConnectionToken": connectionToken,
            "Digits": digits
        ]
        self.httpClient.postJson(url, nil, body) {
            onSuccess()
        } _: { error in
            onFailure(error)
        }
    }
}
