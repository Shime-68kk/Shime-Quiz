# Scheduler Comparison Lab Test Matrix

The comparison lab is implemented in `src/scheduler/schedulerComparisonLab.js`.

Required deterministic scenarios:

- `new_card_good_recall`
- `new_card_bad_recall`
- `mature_card_good_recall`
- `mature_card_lapse`
- `overloaded_review_queue`
- `sparse_history`
- `dense_history`
- `inconsistent_user`
- `cramming_pattern`
- `long_absence_return`
- `low_energy_session`
- `high_review_pressure`

For each scenario, the lab records SM2 output, FSRS beta output, interval delta bucket, due date delta bucket, workload delta bucket, risk codes, FSRS beta promising codes, SM2 safer codes, and a scenario recommendation.

The aggregate recommendation is `keep_sm2_default_fsrs_beta`. The lab must not declare FSRS globally better.
