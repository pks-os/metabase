import { useRef, useState } from "react";
import { t } from "ttag";

import CS from "metabase/css/core/index.css";
import { BreakoutColumnList } from "metabase/query_builder/components/view/sidebars/SummarizeSidebar/BreakoutColumnList";
import { useSummarizeQuery } from "metabase/query_builder/components/view/sidebars/SummarizeSidebar/SummarizeContent";
import { Button, Group, ScrollArea, Stack } from "metabase/ui";
import type * as Lib from "metabase-lib";
import type Question from "metabase-lib/v1/Question";

import { useInteractiveQuestionContext } from "../context";

type SummarizeProps = {
  onClose: () => void;
};

export const Breakout = ({ onClose = () => {} }: Partial<SummarizeProps>) => {
  const { question } = useInteractiveQuestionContext();

  return question && <BreakoutContent question={question} onClose={onClose} />;
};

const BreakoutContent = ({
  question,
  onClose,
}: {
  question: Question;
} & SummarizeProps) => {
  const { updateQuestion } = useInteractiveQuestionContext();

  const onQueryChange = (query: Lib.Query) =>
    updateQuestion(question.setQuery(query), { run: true });

  // save initial question in case we close without making changes
  const initialQuestion = useRef(question.query());

  const [currentQuery, setCurrentQuery] = useState<Lib.Query>(question.query());

  const onApplyFilter = () => {
    if (query) {
      onQueryChange(currentQuery);
      onClose();
    }
  };

  const onCloseFilter = () => {
    if (initialQuestion.current) {
      onQueryChange(initialQuestion.current);
    }
    onClose();
  };

  const {
    query,
    stageIndex,
    handleAddBreakout,
    handleRemoveBreakout,
    handleReplaceBreakouts,
    handleUpdateBreakout,
  } = useSummarizeQuery({
    query: currentQuery,
    onQueryChange: setCurrentQuery,
  });

  return (
    <Stack className={CS.overflowHidden} h="100%">
      <ScrollArea>
        <BreakoutColumnList
          query={query}
          stageIndex={stageIndex}
          onAddBreakout={handleAddBreakout}
          onUpdateBreakout={handleUpdateBreakout}
          onRemoveBreakout={handleRemoveBreakout}
          onReplaceBreakouts={handleReplaceBreakouts}
        />
      </ScrollArea>

      <Group>
        <Button variant="filled" onClick={onApplyFilter}>
          {t`Apply`}
        </Button>
        <Button variant="subtle" color="text-medium" onClick={onCloseFilter}>
          {t`Close`}
        </Button>
      </Group>
    </Stack>
  );
};
