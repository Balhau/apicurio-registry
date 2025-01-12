/**
 * @license
 * Copyright 2021 Red Hat
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

import React from "react";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { SchemaCard, SchemaCardProps } from "./schemaCard";
import { Services } from "src/services";
import { SchemaEmptyState } from "./emptyState";
import {
  PureComponent,
  PureComponentProps,
  PureComponentState,
} from "../baseComponent";

/**
 * Properties
 */

export interface SchemaMappingProps
  extends PureComponentProps,
    SchemaCardProps {
  registryId: string;
}

/**
 * State
 */
export interface SchemaMappingState extends PureComponentState {
  hasKeySchema: boolean | undefined;
  hasValueSchema: boolean | undefined;
}

export class SchemaMapping extends PureComponent<
  SchemaMappingProps,
  SchemaMappingState
> {
  constructor(props: Readonly<SchemaMappingProps>) {
    super(props);
  }

  public render(): React.ReactElement {
    const { hasKeySchema, hasValueSchema } = this.state;
    const { topicName, groupId, version, basename, registryId } = this.props;

    if (hasKeySchema === undefined && hasValueSchema === undefined) {
      return (
        <Bullseye>
          <Spinner />
        </Bullseye>
      );
    }

    if (hasKeySchema || hasValueSchema) {
      return (
        <SchemaCard
          hasKeySchema={hasKeySchema}
          hasValueSchema={hasValueSchema}
          topicName={topicName}
          groupId={groupId}
          version={version}
          basename={basename}
          registryId={registryId}
        />
      );
    } else {
      return (
        <SchemaEmptyState
          artifactName={topicName}
          basename={basename}
          registryId={registryId}
        />
      );
    }
  }

  protected initializeState(): SchemaMappingState {
    return {
      hasKeySchema: undefined,
      hasValueSchema: undefined,
    };
  }

  componentWillMount() {
    this.getArtifactsMetadata();
  }

  componentDidUpdate(prevProps: SchemaMappingProps) {
    if (prevProps.registryId !== this.props.registryId) {
      this.getArtifactsMetadata();
    }
  }

  // @ts-ignore
  private getArtifactsMetadata(): Promise[] | null {
    const { topicName, groupId, version } = this.props;

    Services.getLoggerService().info(
      "Loading data for artifact metadata: ",
      topicName
    );

    const artifactId1 = topicName + "-key";
    const artifactId2 = topicName + "-value";
  

    return [
      Services.getGroupsService()
        .getArtifactMetaData(groupId, artifactId1, version)
        .then((data) => {
          this.setSingleState("hasKeySchema", true);
        })
        .catch((e) => {
          if (e.error_code == "404") {
            this.setSingleState("hasKeySchema", false);
          }
        }),
      Services.getGroupsService()
        .getArtifactMetaData(groupId, artifactId2, version)
        .then((data) => {
          this.setSingleState("hasValueSchema", true);
        })
        .catch((e) => {
          if (e.error_code == "404") {
            this.setSingleState("hasValueSchema", false);
          }
        }),
    ];
  }
}
