//
//  MeetingSessionConfiguration.swift
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation
import AmazonChimeSDK

extension MeetingSessionConfiguration {

    convenience init?(_ response: CreateWebrtcContactResponse) {

        let connectionData = response.connectionData

        let meeting = connectionData.meeting
        let meetingId = meeting.meetingId
        let attendee = connectionData.attendee

        let credentials = MeetingSessionCredentials(attendeeId: attendee.attendeeId,
                                                    externalUserId: "",
                                                    joinToken: attendee.joinToken)

        let mediaPlacement = meeting.mediaPlacement

        guard let audioFallbackUrl = mediaPlacement.audioFallbackUrl else {
            return nil
        }

        guard let audioHostUrl = mediaPlacement.audioHostUrl else {
            return nil
        }

        guard let turnControlUrl = mediaPlacement.turnControlUrl else {
            return nil
        }

        guard let signalingUrl = mediaPlacement.signalingUrl else {
            return nil
        }

        let urls = MeetingSessionURLs(audioFallbackUrl: audioFallbackUrl,
                                      audioHostUrl: audioHostUrl,
                                      turnControlUrl: turnControlUrl,
                                      signalingUrl: signalingUrl,
                                      urlRewriter: URLRewriterUtils.defaultUrlRewriter,
                                      ingestionUrl: mediaPlacement.eventIngestionUrl)

        self.init(meetingId: meetingId,
                  externalMeetingId: nil,
                  credentials: credentials,
                  urls: urls,
                  urlRewriter: URLRewriterUtils.defaultUrlRewriter)
    }
}

// CustomStringConvertible
extension MeetingSessionConfiguration {

    public override var description: String {
        return "<\(type(of: self)): meetingId = \(self.meetingId)>"
    }
}
