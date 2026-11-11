# -*- coding: utf-8 -*-
"""Which wireframes each story file draws (section "## 5. Wireframe"). Source of truth for sync_docs.py.

Key: story file path relative to docs/features. AUTH stories are taken from the headings already in the file
(see sync_docs.py), so only the FEAT-02 stories that were redesigned are listed here.
"""
STORY_SCREENS = {
    "knowledge-items/srs/US-LIB-01-save-vocabulary-and-grammar.md": [8, 9, 10, 11, 12, 16, 17],
    "knowledge-items/srs/US-LIB-02-similar-item-hint.md": [8, 13, 14, 15, 16],
    "knowledge-items/srs/US-LIB-03-list-items.md": [1, 2, 3, 4, 5, 6, 7],
    "knowledge-items/srs/US-LIB-04-view-item.md": [16, 17, 18, 19, 20],
    "knowledge-items/srs/US-LIB-05-edit-item.md": [21, 22, 23, 16, 17, 19],
    "knowledge-items/srs/US-LIB-06-delete-item.md": [24, 25, 26],
    "knowledge-items/srs/US-LIB-07-private-library.md": [1, 3, 19],
    "knowledge-items/srs/US-LIB-08-auto-ipa.md": [27, 28, 29, 30, 31, 9],
    "knowledge-items/srs/US-LIB-09-meaning-suggestions.md": [32, 33, 34, 35],
}
