package com.apigateway.api_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.mongodb.autoconfigure.MongoAutoConfiguration;

@SpringBootApplication(exclude = {MongoAutoConfiguration.class})

public class ApiManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiManagementApplication.class, args);
	}

}
