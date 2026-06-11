{{/*
Chart name.
*/}}
{{- define "vao.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fullname: release-aware naming.
*/}}
{{- define "vao.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels applied to every resource.
Merges standard app.kubernetes.io labels with global.extraLabels.
*/}}
{{- define "vao.labels" -}}
app.kubernetes.io/name: {{ include "vao.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Values.global.imageTag | default .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- with .Values.global.extraLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Component labels: common labels + app.kubernetes.io/component.
Usage: include "vao.componentLabels" (dict "context" . "component" "backend")
*/}}
{{- define "vao.componentLabels" -}}
{{ include "vao.labels" .context }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Selector labels for a component.
Usage: include "vao.selectorLabels" (dict "context" . "component" "backend")
*/}}
{{- define "vao.selectorLabels" -}}
app.kubernetes.io/name: {{ include "vao.name" .context }}
app.kubernetes.io/instance: {{ .context.Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Common annotations applied to every resource.
Merges global.extraAnnotations.
*/}}
{{- define "vao.annotations" -}}
{{- with .Values.global.extraAnnotations }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Build image reference for a component.
Usage: include "vao.image" (dict "context" . "package" "backend")
*/}}
{{- define "vao.image" -}}
{{- printf "%s/%s:%s" .context.Values.global.imageRegistry .package (.context.Values.global.imageTag | default .context.Chart.AppVersion) }}
{{- end }}

{{/*
ServiceAccount name.
*/}}
{{- define "vao.serviceAccountName" -}}
{{- if .Values.serviceAccount.name }}
{{- .Values.serviceAccount.name }}
{{- else }}
{{- include "vao.fullname" . }}
{{- end }}
{{- end }}

{{/*
imagePullSecrets block.
*/}}
{{- define "vao.imagePullSecrets" -}}
{{- with .Values.global.imagePullSecrets }}
imagePullSecrets:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- end }}

{{/*
Pod anti-affinity: prefer spreading pods of the same component across nodes.
Usage: include "vao.podAntiAffinity" (dict "context" . "component" "backend")
*/}}
{{- define "vao.podAntiAffinity" -}}
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 1
        podAffinityTerm:
          labelSelector:
            matchLabels:
              {{- include "vao.selectorLabels" (dict "context" .context "component" .component) | nindent 14 }}
          topologyKey: kubernetes.io/hostname
{{- end }}
