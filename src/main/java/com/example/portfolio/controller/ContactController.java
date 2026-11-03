package com.example.portfolio.controller;

import com.example.portfolio.dto.ContactMessageRequest;
import com.example.portfolio.dto.ContactMessageResponse;
import com.example.portfolio.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse submit(@Valid @RequestBody ContactMessageRequest request) {
        return contactService.save(request);
    }
}
