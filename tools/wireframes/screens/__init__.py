# -*- coding: utf-8 -*-
"""Registry of wireframe screens. Each screen has an id (W-AUTH-09, W-LIB-01...), a title and behaviour notes.

Screens that already have a Figma export are registered with `image=` (path relative to the feature folder) and are not
drawn here. Every other screen has a builder that returns an AppShell, AuthShell or Fragment.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Optional

REGISTRY: dict[str, "Screen"] = {}


@dataclass
class Screen:
    wid: str
    feature: str            # folder under docs/features: accounts | knowledge-items
    title: str
    notes: list[str]
    build: Optional[Callable] = None
    image: Optional[str] = None   # existing image (Figma export), relative to the feature folder

    @property
    def svg_name(self) -> str:
        return f"wireframes/{self.wid}.svg"


def screen(wid: str, feature: str, title: str, notes: list[str]):
    def deco(fn):
        REGISTRY[wid] = Screen(wid, feature, title, notes, build=fn)
        return fn
    return deco


def figma(wid: str, feature: str, title: str, notes: list[str], image: str):
    REGISTRY[wid] = Screen(wid, feature, title, notes, image=image)
