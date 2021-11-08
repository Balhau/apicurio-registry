/*
 * Copyright 2018 Confluent Inc. (adapted from their Mojo)
 * Copyright 2020 Red Hat
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.apicurio.registry.maven;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.apicurio.registry.auth.Auth;
import io.apicurio.registry.auth.BasicAuth;
import io.apicurio.registry.auth.KeycloakAuth;
import io.apicurio.registry.types.ContentTypes;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.Parameter;

import io.apicurio.registry.rest.client.RegistryClient;
import io.apicurio.registry.rest.client.RegistryClientFactory;

import java.io.File;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;


/**
 * Base class for all Registry Mojo's.
 * It handles RegistryService's (aka client) lifecycle.
 *
 * @author Ales Justin
 */
public abstract class AbstractRegistryMojo extends AbstractMojo {

    public static class FileArtifact<T> {
        public FileArtifact(List<T> artifacts) {
            this.artifacts = artifacts;
        }

        @JsonProperty
        List<T> artifacts;

        public List<T> getArtifacts() {
            return artifacts;
        }

        public void setArtifacts(List<T> artifacts) {
            this.artifacts = artifacts;
        }
    }

    /**
     * The registry's url.
     * e.g. http://localhost:8080/api/v2
     */
    @Parameter(required = true, property = "registry.url")
    String registryUrl;

    @Parameter(property = "auth.server.url")
    String authServerUrl;

    @Parameter(property = "client.id")
    String clientId;

    @Parameter(property = "client.secret")
    String clientSecret;

    @Parameter(property = "username")
    String username;

    @Parameter(property = "password")
    String password;

    private static RegistryClient client;

    protected RegistryClient getClient() {
        if (client == null) {
            if (authServerUrl != null && clientId != null && clientSecret != null) {
                Auth auth = new OidcAuth(authServerUrl, clientId, clientSecret, Optional.empty());
                client = RegistryClientFactory.create(registryUrl, Collections.emptyMap(), auth);
            } else if (username != null && password != null) {
                Auth auth = new BasicAuth(username, password);
                client = RegistryClientFactory.create(registryUrl, Collections.emptyMap(), auth);
            } else {
                client = RegistryClientFactory.create(registryUrl);
            }
        }
        return client;
    }


    public <T> FileArtifact<T> parseArtifacts(final String configPath, Class<T> clazz) throws MojoExecutionException {
        final ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        List<T> artifacts = null;
        FileArtifact<T> fileArtifacts=null;
        try {
            artifacts = mapper.readValue(new File(configPath), (Class<List<T>>) (Object) List.class);
            fileArtifacts = new FileArtifact(artifacts);
        } catch (Exception ex) {
            throw new MojoExecutionException("Error while parsing artifacts config file");
        }
        return fileArtifacts;
    }



    public void setClient(RegistryClient client) {
        AbstractRegistryMojo.client = client;
    }

    @Override
    public void execute() throws MojoExecutionException, MojoFailureException {
        executeInternal();
    }

    protected abstract void executeInternal() throws MojoExecutionException, MojoFailureException;

    protected String getContentTypeByExtension(String fileName){
        if(fileName == null) return null;
        String[] temp = fileName.split("[.]");
        String extension = temp[temp.length - 1];
        switch (extension.toLowerCase(Locale.ROOT)){
            case "avro":
            case "avsc":
            case "json":
                return ContentTypes.APPLICATION_JSON;
            case "yml":
            case "yaml":
                return ContentTypes.APPLICATION_YAML;
            case "graphql":
                return ContentTypes.APPLICATION_GRAPHQL;
            case "proto":
                return ContentTypes.APPLICATION_PROTOBUF;
            case "wsdl":
            case "xsd":
            case "xml":
                return ContentTypes.APPLICATION_XML;
        }
        return null;
    }

    public void setRegistryUrl(String registryUrl) {
        this.registryUrl = registryUrl;
    }

    public void setAuthServerUrl(String authServerUrl) {
        this.authServerUrl = authServerUrl;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
