/* eslint-disable */

import { useDisclosure } from "@mantine/hooks";
import cx from "classnames";
import { type ReactElement, type ReactNode, useState } from "react";
import { match } from "ts-pattern";
import { t } from "ttag";

import {
  SdkError,
  SdkLoader,
} from "embedding-sdk/components/private/PublicComponentWrapper";
import { SaveQuestionModal } from "metabase/containers/SaveQuestionModal";
import { ActionIcon, Title, Button, Group, Icon, Popover } from "metabase/ui";

import { InteractiveQuestion } from "../../public/InteractiveQuestion";
import { useInteractiveQuestionContext } from "../InteractiveQuestion/context";
import {
  FlexibleSizeComponent,
  type FlexibleSizeProps,
} from "../util/FlexibleSizeComponent";

import InteractiveQuestionS from "./InteractiveQuestionResult.module.css";
import { getIconForVisualizationType } from "metabase/visualizations";

export interface InteractiveQuestionResultProps {
  withResetButton?: boolean;
  withTitle?: boolean;
  customTitle?: ReactNode;
}

type QuestionView = "editor" | "filter" | "summarize" | "visualization";

const ContentView = ({
  questionView,
  onReturnToVisualization,
}: {
  questionView: QuestionView;
  onReturnToVisualization: () => void;
}) =>
  match<QuestionView>(questionView)
    .with("filter", () => (
      <InteractiveQuestion.Filter onClose={onReturnToVisualization} />
    ))
    .with("summarize", () => (
      <InteractiveQuestion.Summarize onClose={onReturnToVisualization} />
    ))
    .with("editor", () => (
      <InteractiveQuestion.Editor onApply={onReturnToVisualization} />
    ))
    .otherwise(() => (
      <InteractiveQuestion.QuestionVisualization height="100%" />
    ));

export const InteractiveQuestionDefaultView = ({
  height,
  width,
  className,
  style,
  withTitle,
  customTitle,
  withResetButton,
}: InteractiveQuestionResultProps & FlexibleSizeProps): ReactElement => {
  const [questionView, setQuestionView] =
    useState<QuestionView>("visualization");

  const {
    question,
    queryResults,
    isQuestionLoading,
    originalQuestion,
    onCreate,
    onSave,
    isSaveEnabled,
    saveToCollectionId,
  } = useInteractiveQuestionContext();

  const [isChartSelectorOpen, { toggle: toggleChartTypeSelector }] =
    useDisclosure(false);

  const [isSaveModalOpen, { open: openSaveModal, close: closeSaveModal }] =
    useDisclosure(false);

  const [isNotebookOpen, { open, close, toggle }] = useDisclosure(false);

  if (isQuestionLoading) {
    return <SdkLoader />;
  }

  if (!question || !queryResults) {
    return <SdkError message={t`Question not found`} />;
  }

  return (
    <FlexibleSizeComponent
      height={height}
      width={width}
      className={cx(InteractiveQuestionS.Container, className)}
      style={style}
    >
      <Group position="apart" align="center">
        <Group>
          <Title order={5}>{question?.displayName() ?? t`New Question`}</Title>
        </Group>
        <Group>
          {!isNotebookOpen && (
            <>
              <Popover>
                <Popover.Target>
                  <Button compact>Filter</Button>
                </Popover.Target>
                <Popover.Dropdown h="30vh">
                  <InteractiveQuestion.Filter />
                </Popover.Dropdown>
              </Popover>
              <Popover>
                <Popover.Target>
                  <Button compact>See filters</Button>
                </Popover.Target>
                <Popover.Dropdown h="30vh">
                  <InteractiveQuestion.FilterBar />
                </Popover.Dropdown>
              </Popover>
              <Popover>
                <Popover.Target>
                  <Button compact>Summarize</Button>
                </Popover.Target>
                <Popover.Dropdown h="50vh">
                  <InteractiveQuestion.Summarize />
                </Popover.Dropdown>
              </Popover>
              <Popover>
                <Popover.Target>
                  <Button compact>Breakout</Button>
                </Popover.Target>
                <Popover.Dropdown h="30vh">
                  <InteractiveQuestion.Breakout />
                </Popover.Dropdown>
              </Popover>
              <Popover>
                <Popover.Target>
                  <ActionIcon>
                    <Icon
                      name={getIconForVisualizationType(question.display())}
                    />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown h="30vh">
                  <InteractiveQuestion.ChartTypeSelector />
                </Popover.Dropdown>
              </Popover>
              <Popover>
                <Popover.Target>
                  <ActionIcon>
                    <Icon name="gear" />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown h="30vh">
                  <InteractiveQuestion.QuestionSettings />
                </Popover.Dropdown>
              </Popover>
            </>
          )}
          <ActionIcon onClick={toggle}>
            <Icon name="notebook" />
          </ActionIcon>
        </Group>
      </Group>
      {isNotebookOpen ? (
        <InteractiveQuestion.Notebook onApply={close} />
      ) : (
        <InteractiveQuestion.QuestionVisualization height="100%" />
      )}
    </FlexibleSizeComponent>
  );
};
