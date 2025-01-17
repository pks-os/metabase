(ns metabase.api.routes.common
  "Shared helpers used by [[metabase.api.routes/routes]] as well as premium-only routes
  like [[metabase-enterprise.sandbox.api.routes/routes]]."
  (:require
   [metabase.server.core :as server]))

;;; these use vars rather than plain functions so changes to the underlying functions get propagated during REPL usage.

(def +public-exceptions
  "Wrap `routes` so any Exception except 404 thrown is just returned as a generic 400, to prevent details from leaking
  in public endpoints."
  #'server/public-exceptions)

(def +message-only-exceptions
  "Wrap `routes` so any Exception thrown is just returned as a 400 with only the message from the original
  Exception (i.e., remove the original stacktrace), to prevent details from leaking in public endpoints."
  #'server/message-only-exceptions)

(def +static-apikey
  "Wrap `routes` so they may only be accessed with a correct API key header."
  #'server/enforce-static-api-key)

(def +auth
  "Wrap `routes` so they may only be accessed with proper authentication credentials."
  #'server/enforce-authentication)
