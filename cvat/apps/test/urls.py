# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.urls import include, path
from rest_framework import routers

from .views import LabelCountsViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register("label-counts", LabelCountsViewSet, basename="label_counts")

urlpatterns = [
    path("test/", include(router.urls)),
]
