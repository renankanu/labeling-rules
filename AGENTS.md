<!-- BEGIN:kanu-harness-v3 -->
## Harness Kanu v3 — entrega autônoma

```yaml
harness_version: 3
autonomy: full
plan_approval: independent_agent
review_required: true
target_branch: main
done_when: merged
```

Contrato global: ~/.agents/HARNESS.md, ~/.agents/roles/ e .harness/stack.md. Entrada: kn-run entrega <url-ou-id-Linear>.
- Fluxo: intake -> kn-plan -> kn-review (plan) [Track A] -> kn-dev -> check.sh qa -> check.sh ci -> kn-review (code) -> PR (main) -> merge & sync.
- Gates: ./scripts/check.sh fast | phase | qa | ci.
<!-- END:kanu-harness-v3 -->

# labeling-rules
