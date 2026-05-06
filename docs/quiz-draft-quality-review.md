# Quiz draft quality review

Phase 7F adds an advisory quality review layer for generated/imported quiz drafts.

The review runs before users save a draft and helps them notice suspicious items, such as duplicate multiple-choice options, short questions, missing answers, default subject/topic names, or very small drafts.

## What it does

- Reviews draft data in the existing flat v2 shape: `subjects`, `topics`, `items`.
- Produces lightweight internal warnings with stable codes.
- Shows Vietnamese advisory messages in the existing import preview flow.
- Keeps existing import validation as the source of hard blocking behavior.
- Does not store quality review results in user data.

## What it does not do

- It does not guarantee high-quality quiz generation.
- It does not use AI.
- It does not auto-fix or rewrite quiz content.
- It does not add OCR.
- It does not change the import schema, storage schema, scoring, SRT, mastery, or backup schema.

Users should still review generated questions before saving.
