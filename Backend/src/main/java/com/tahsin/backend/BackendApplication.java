package com.tahsin.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication(exclude = {
    org.springframework.ai.model.openai.autoconfigure.OpenAiAudioSpeechAutoConfiguration.class,
    org.springframework.ai.model.openai.autoconfigure.OpenAiAudioTranscriptionAutoConfiguration.class,
    org.springframework.ai.model.openai.autoconfigure.OpenAiChatAutoConfiguration.class,
    org.springframework.ai.model.openai.autoconfigure.OpenAiEmbeddingAutoConfiguration.class,
    org.springframework.ai.model.openai.autoconfigure.OpenAiImageAutoConfiguration.class,
    org.springframework.ai.model.openai.autoconfigure.OpenAiModerationAutoConfiguration.class
})
@EnableScheduling


public class BackendApplication {

	public static void main(String[] args) {
		
		 Dotenv dotenv = Dotenv.load();
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );
		SpringApplication.run(BackendApplication.class, args);
	}

}
