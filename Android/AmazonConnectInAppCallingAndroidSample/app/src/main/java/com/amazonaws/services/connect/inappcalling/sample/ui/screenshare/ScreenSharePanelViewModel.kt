package com.amazonaws.services.connect.inappcalling.sample.ui.screenshare

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoRenderView
import com.amazonaws.services.chime.sdk.meetings.audiovideo.video.VideoTileState
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallManager
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallObserver
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallStateRepository
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareStatus
import kotlinx.coroutines.launch

class ScreenSharePanelViewModel(
    private val callManager: CallManager,
    private val callStateRepository: CallStateRepository
) : ViewModel(), CallObserver {

    init {
        callStateRepository.addCallObserver(observer = this)
    }

    private val _screenShareStatus = MutableLiveData(callStateRepository.getScreenShareStatus())
    val screenShareStatus: LiveData<ScreenShareStatus> = _screenShareStatus

    private val _screenShareTileState = MutableLiveData(callStateRepository.getScreenShareTileState())
    val screenShareTileState: LiveData<VideoTileState?> = _screenShareTileState

    override fun onScreenShareStatusChanged(status: ScreenShareStatus) {
        _screenShareStatus.postValue(status)
    }

    override fun onScreenShareTileStateChanged(tileState: VideoTileState?) {
        _screenShareTileState.postValue(tileState)
    }

    fun bindLocalScreenShareView(videoRenderView: VideoRenderView) {
        viewModelScope.launch {
            callManager.bindLocalScreenShareView(videoRenderView)
        }
    }

    fun unbindLocalScreenShareView(videoRenderView: VideoRenderView) {
        viewModelScope.launch {
            callManager.unbindLocalScreenShareView(videoRenderView)
        }
    }

    fun bindVideoView(viewRenderView: VideoRenderView, tileId: Int) {
        viewModelScope.launch {
            callManager.bindVideoView(viewRenderView, tileId)
        }
    }

    fun unbindVideoView(tileState: VideoTileState) {
        viewModelScope.launch {
            callManager.unbindVideoView(tileState.tileId)
        }
    }
}
