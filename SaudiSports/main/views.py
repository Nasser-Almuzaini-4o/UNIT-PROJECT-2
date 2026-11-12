from django.http import HttpRequest
from django.shortcuts import render, redirect


# ---------- Pages ----------

def home_view(request: HttpRequest):
    return render(request, "main/home.html")


def football_view(request: HttpRequest):
    return render(request, "main/football.html")


def formula_view(request: HttpRequest):
    return render(request, "main/formula.html")


def rallies_view(request: HttpRequest):
    return render(request, "main/rallies.html")


def esports_view(request: HttpRequest):
    return render(request, "main/esports.html")


def community_view(request: HttpRequest):
    return render(request, "main/community.html")


def events_view(request: HttpRequest):
    return render(request, "main/events.html")


def stadiums_view(request: HttpRequest):
    return render(request, "main/stadiums.html")

def olympic_view(request: HttpRequest):
    return render(request, "main/olympic.html")


# ---------- Dark / light mode (saved in a cookie) ----------

def mode_view(request: HttpRequest, mode):
    response = redirect(request.GET.get("next", "/"))

    if mode == "light":
        response.set_cookie("mode", "light")
    elif mode == "dark":
        response.set_cookie("mode", "dark")

    return response
