# Entidades funcionales — U1 Esqueleto que corre

```yaml
unit: u1-app-skeleton
entities:
  - id: SessionView
    description: Estado observable de la sesión simulada de la aplicación.
    attributes:
      - {name: status, logical_type: enum, required: true, allowed_values: [signedIn, signedOut]}
      - {name: authorId, logical_type: string, required: true, unique: true, allowed_values: [demo], references: Author.authorId}
      - {name: remembered, logical_type: boolean, required: true, default: false}
    constraints:
      - signedIn requiere authorId=demo y remembered=true.
      - signedOut conserva la forma del contrato C3; no concede acceso a las pestañas.
      - loading y signingIn son estados internos de AppSession y nunca se emiten como SessionView.
  - id: Session
    description: Recuerdo local de una entrada válida de la persona demo.
    attributes:
      - {name: authorId, logical_type: string, required: true, unique: true, allowed_values: [demo]}
      - {name: startedAt, logical_type: datetime, required: true}
      - {name: remembered, logical_type: boolean, required: true, default: true}
    constraints:
      - No contiene tokens de Spotify ni datos de credenciales.
  - id: Author
    description: Identidad mínima de la autora de la opinión sembrada.
    attributes:
      - {name: authorId, logical_type: string, required: true, unique: true, allowed_values: [demo]}
      - {name: displayName, logical_type: string, required: true, default: Demo}
      - {name: handle, logical_type: string, required: true, default: '@demo'}
  - id: WorkSummary
    description: Obra local mínima mostrada por la tarjeta de U1.
    attributes:
      - {name: workId, logical_type: string, required: true, unique: true, constraints: identificador estable de la semilla local}
      - {name: title, logical_type: string, required: true}
      - {name: artist, logical_type: string, required: true}
      - {name: coverUrl, logical_type: string|null, required: true, default: null}
      - {name: origin, logical_type: enum, required: true, allowed_values: [sample], default: sample}
  - id: OpinionCardModel
    description: Opinión única y determinista que demuestra el recorrido de U1.
    attributes:
      - {name: opinionId, logical_type: string, required: true, unique: true}
      - {name: authorId, logical_type: string, required: true, references: Author.authorId}
      - {name: workId, logical_type: string, required: true, references: WorkSummary.workId}
      - {name: text, logical_type: string, required: true, constraints: breve y en español}
      - {name: rating, logical_type: integer, required: true, min: 1, max: 5, default: 4}
      - {name: createdAt, logical_type: datetime, required: true}
      - {name: likeCount, logical_type: integer, required: true, min: 0, default: 0}
      - {name: commentCount, logical_type: integer, required: true, min: 0, default: 0}
    constraints:
      - La semilla usa authorId=demo, rating=4, likeCount=0 y commentCount=0.
  - id: TabItem
    description: Destino raíz de la navegación autenticada.
    attributes:
      - {name: name, logical_type: enum, required: true, unique: true, allowed_values: [Inicio, Explorar, Crear, Actividad, Perfil]}
      - {name: label, logical_type: string, required: true}
      - {name: icon, logical_type: string, required: true}
    constraints:
      - El conjunto contiene exactamente cinco destinos en el orden declarado.
relationships:
  - {from: SessionView, to: Author, cardinality: '0..1 -> 1', direction: SessionView.authorId references Author.authorId}
  - {from: Session, to: Author, cardinality: '1 -> 1', direction: Session.authorId references Author.authorId}
  - {from: OpinionCardModel, to: Author, cardinality: '1 -> 1', direction: OpinionCardModel.authorId references Author.authorId}
  - {from: OpinionCardModel, to: WorkSummary, cardinality: '1 -> 1', direction: OpinionCardModel.workId references WorkSummary.workId}
```

La unidad posee el estado mínimo de sesión, una identidad demo, una obra local
y una opinión determinista. El contenido es efímero y vive en memoria; el único
recuerdo entre reinicios es `Session`. `TabItem` pertenece a `AppShell` y no
representa una entidad de contenido.

Las decisiones Q1-Q9 fueron confirmadas antes de generar este diseño. La forma
observable de `SessionView` sigue C3: solo `signedIn` y `signedOut`; los estados
transitorios de arranque y entrada pertenecen al estado interno de
`AppSession`.
