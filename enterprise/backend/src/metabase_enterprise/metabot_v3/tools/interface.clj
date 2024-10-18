(ns metabase-enterprise.metabot-v3.tools.interface
  (:require
   [metabase-enterprise.metabot-v3.reactions :as metabot-v3.reactions]
   [metabase.lib.schema.common :as lib.schema.common]
   [metabase.util :as u]
   [metabase.util.i18n :as i18n :refer [tru]]
   [metabase.util.malli :as mu]
   [metabase.util.malli.registry :as mr]))

(set! *warn-on-reflection* true)

(mr/def ::metadata.parameter.type
  :keyword)

(mr/def ::metadata.parameter.name
  [:and
   {:decode/metadata-file (fn [x]
                            (keyword (u/->kebab-case-en x)))
    :encode/api-request   (fn [x]
                            (u/->snake_case_en (name x)))
    :decode/api-response  (fn [x]
                            (keyword (u/->kebab-case-en x)))}
   :keyword
   [:fn
    {:error/message "PARSED parameter names should be kebab-case (in JSON files they should use camelCase)"}
    #(= (u/->kebab-case-en %) %)]])

(mr/def ::metadata.parameter
  [:map
   [:type [:or
           ::metadata.parameter.type
           [:set ::metadata.parameter.type]]]
   [:description {:optional true} [:maybe ::lib.schema.common/non-blank-string]]])

(mr/def ::metadata.parameters.properties
  [:map-of ::metadata.parameter.name ::metadata.parameter])

(mr/def ::metadata.parameters
  [:map
   {:decode/metadata-file #(update-keys % (comp keyword u/->kebab-case-en))
    :decode/api-response  #(update-keys % (comp keyword u/->kebab-case-en))
    :encode/api-request   #(update-keys % u/->camelCaseEn)}
   [:type                  [:= {:decode/metadata-file keyword} :object]]
   [:properties            ::metadata.parameters.properties]
   [:required              {:optional true, :default []} [:sequential ::metadata.parameter.name]]
   [:additional-properties {:optional true, :default false} :boolean]])

(mr/def ::metadata.name
  [:and
   :keyword
   [:fn
    {:error/message "Tool names should be kebab-case (both parsed and in YAML files)"}
    #(= (u/->kebab-case-en %) %)]])

(mr/def ::metadata
  [:map
   [:name        ::metadata.name]
   [:description ::lib.schema.common/non-blank-string]
   [:parameters  ::metadata.parameters]])

(defmulti ^:dynamic *tool-applicable?*
  "Whether or not the current tool can possibly be applicable and passed to the AI Proxy. For example, an `invite-user`
  tool cannot be applicable if the current user does not have user invite permissions. We should error on the side of
  letting the LLM decide whether a tool is appropriate or not in cases where y
  it's in any way ambiguous -- we should
  not be parsing the message string or making these sorts of decisions ourselves."
  {:arglists '([tool-name context])}
  (fn [tool-name _context]
    (keyword tool-name)))

(defmethod *tool-applicable?* :default
  [_tool-name _context]
  true)

(defmulti ^:dynamic *invoke-tool*
  "Invoke a Metabot v3 tool, e.g. send an email to someone. This should return a vector of frontend reactions with a
  shape like

    [{:type    :reaction/display-message
      :message \"I need more info.\"}]

  Different reactions should get bundled with different keys, for example `:metabot.reaction/message` should include
  `:message`. This should match what the frontend expects."
  {:arglists '([tool-name argument-map])}
  (fn [tool-name _argument-map]
    (keyword tool-name)))

(mu/defmethod *invoke-tool* :default :- [:sequential ::metabot-v3.reactions/reaction]
  [tool-name argument-map]
  [{:type    :metabot.reaction/message
    :message (tru "Tool is not yet implemented: {0}"
                  (pr-str (list tool-name argument-map)))}])