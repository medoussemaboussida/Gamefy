package com.gamefy.gamefy_back.service;

import com.gamefy.gamefy_back.repository.WorkDaysScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkDaysScheduleService {

    private final WorkDaysScheduleRepository repository;

}
