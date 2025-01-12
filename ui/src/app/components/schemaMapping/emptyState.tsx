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
import { Link } from "react-router-dom";
import {
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateVariant,
  ClipboardCopy,
  EmptyStateSecondaryActions,
  Card,
  CardBody,
  CardTitle,
} from "@patternfly/react-core";
import ArrowRightIcon from "@patternfly/react-icons/dist/js/icons/arrow-icon";
import InfoCircleIcon from "@patternfly/react-icons/dist/js/icons/info-circle-icon";

export type EmptyStateProps = {
  artifactName: string;
  basename: string;
  registryId: string;
};

export const SchemaEmptyState: React.FC<EmptyStateProps> = ({
  artifactName,
  basename,
  registryId,
}: EmptyStateProps) => {
  return (
    <Card>
      <CardTitle>Topic Schemas</CardTitle>
      <CardBody>
        <EmptyState variant={EmptyStateVariant.large}>
          <EmptyStateIcon icon={InfoCircleIcon} color="#2B9AF3" />
          <Title headingLevel="h4" size="lg">
            No matching schema exists for the selected instance
          </Title>
          <EmptyStateBody>
            The system couldn't find a matching schema for this topic in the
            selected Service Registry instance. Please make sure to use the
            following naming format for the artifact ID:
          </EmptyStateBody>
          <EmptyStateSecondaryActions>
            <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
              {artifactName + "-key"}
            </ClipboardCopy>
          </EmptyStateSecondaryActions>
          <EmptyStateSecondaryActions>
            <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
              {artifactName + "-value"}
            </ClipboardCopy>
          </EmptyStateSecondaryActions>
          <EmptyStateSecondaryActions>
            <Link to={`${basename}/t/${registryId}`}>
              Go to Service Registry instance <ArrowRightIcon />
            </Link>
          </EmptyStateSecondaryActions>
        </EmptyState>
      </CardBody>
    </Card>
  );
};
