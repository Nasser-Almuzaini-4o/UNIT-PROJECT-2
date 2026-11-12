from django.urls import path
from . import views

urlpatterns = [
    path("", views.home_view, name="home_view"),
    path("football/", views.football_view, name="football_view"),
    path("formula/", views.formula_view, name="formula_view"),
    path("rallies/", views.rallies_view, name="rallies_view"),
    path("esports/", views.esports_view, name="esports_view"),
    path("community/", views.community_view, name="community_view"),
    path("events/", views.events_view, name="events_view"),
    path("stadiums/", views.stadiums_view, name="stadiums_view"),
    path("mode/<mode>/", views.mode_view, name="mode_view"),
    path("olympic/", views.olympic_view, name="olympic_view"),
]
