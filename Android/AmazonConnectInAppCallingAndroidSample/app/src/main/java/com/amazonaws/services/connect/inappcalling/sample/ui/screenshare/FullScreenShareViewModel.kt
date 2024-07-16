package com.amazonaws.services.connect.inappcalling.sample.ui.screenshare

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallObserver
import com.amazonaws.services.connect.inappcalling.sample.data.domain.CallStateRepository
import com.amazonaws.services.connect.inappcalling.sample.data.domain.screenshare.ScreenShareStatus

class FullScreenShareViewModel(
    private val callStateRepository: CallStateRepository
) : ViewModel(), CallObserver {

    init {
        callStateRepository.addCallObserver(observer = this)
    }

    private val _screenShareStatus = MutableLiveData(callStateRepository.getScreenShareStatus())
    val screenShareStatus: LiveData<ScreenShareStatus> = _screenShareStatus

    override fun onScreenShareStatusChanged(status: ScreenShareStatus) {
        _screenShareStatus.postValue(status)
    }
}