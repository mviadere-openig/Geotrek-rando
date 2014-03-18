#!/usr/bin/env python
# -*- coding: utf8 -*-
import os
import sys


PROJECT_PATH = os.path.dirname(os.path.dirname(__file__))

DEBUG = False
TEMPLATE_DEBUG = DEBUG
TEST = 'test' in sys.argv
PREPROD = False
ALLOWED_HOSTS = ('*',)

ADMINS = (
    ('Makina Corpus', 'geobi@makina-corpus.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'never_used.db',
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'Europe/Paris'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'fr'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True


INPUT_DATA_ROOT = os.path.join(PROJECT_PATH, '..', 'var', 'input')
INPUT_TMP_ROOT = os.path.join(PROJECT_PATH, '..', 'var', 'tmp')
MEDIA_ROOT = os.path.join(INPUT_DATA_ROOT, 'media')
MEDIA_URL = '/media/'
STATIC_ROOT = os.path.join(PROJECT_PATH, '..', 'var', 'static')
STATIC_URL = '/static/'


# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_PATH, 'static'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    # 'django.contrib.staticfiles.finders.DefaultStorageFinder',
    # other finders..
    'compressor.finders.CompressorFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '5w&amp;uq=z1w*axjm6z)&amp;)uq3^mg#q2=!@t_f^@_w)9o0+p*c4h+0'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    # 'django.template.loaders.eggs.Loader',
)

CACHE_DURATION = 60 * 60 * 1  # 1 Hour
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake'
    }
}

MIDDLEWARE_CLASSES = (
    'localeurl.middleware.LocaleURLMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'rando.middleware.DoNotTrackMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.request',
    'django.core.context_processors.media',
    'rando.context_processors.settings',
    'rando.context_processors.pjax',
    'rando.context_processors.donottrack',
    'rando.trekking.context_processors.main',
)

ROOT_URLCONF = 'rando.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'rando.wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or
    # "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_PATH, 'templates')
)

INSTALLED_APPS = (
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    # Uncomment the next line to enable the admin:
    # 'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
    'ganalytics',
    'leaflet',
    'localeurl',
    'compressor',
    'rando.trekking',
    'rando.view3d',
    'rando.flatpages',
    'rando.feedback',
    'captcha',
)

if TEST:
    INSTALLED_APPS += ('casper',)


COMPRESS_PARSER = 'compressor.parser.HtmlParser'

FLATPAGES_ROOT = os.path.join(MEDIA_ROOT, 'pages')
FLATPAGES_TITLES = {}
FLATPAGES_POLICY_PAGE = 1

FILTERS_HASH_ENABLED = True
FILTER_ASCENT_VALUES = (300, 600, 1000, 1400)

LEAFLET_CONFIG = {
    "TILES": [
        ('main', 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
         '&copy; OpenStreetMap contributors'),
        ('detail', 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
         '&copy; OpenStreetMap contributors')
    ],
    "SCALE": False,
    "MINIMAP": True,
    "NO_GLOBALS": False
}

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['console', 'mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'django': {
            'handlers': ['console', 'mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'rando': {
            'handlers': ['console', 'mail_admins'],
            'level': 'WARNING',
            'propagate': False,
        },
        '': {
            'handlers': ['console', 'mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
    }
}

TEST_RUNNER = 'rando.testing.DatabaselessTestRunner'

GEOTREK_SERVER = 'localhost:8000'
GEOTREK_LOGIN_URL = 'login/'
GEOTREK_USER = 'admin'
GEOTREK_PASSWORD = 'admin'

TITLE = {
    'en': "Trekking",
    'fr': "Portail rando",
}

DESCRIPTION = {
    'en': "Catalog of treks",
    'fr': "Offre rando",
}

FOOTER_FILENAME = 'footer.html'
POPUP_FILENAME = 'popup_home.html'
POPUP_HOME_ENABLED = False
PRINT_ENABLED = False
VIEW3D_ENABLED = True

GANALYTICS_TRACKING_CODE = 'UA-XXXXXXXX-XX'

COORDS_FORMAT_PRECISION = 5

###
# FEEDBACK APP CONFIG PART

# Enabling feedback form on trek detail page
FEEDBACK_FORM_ENABLED = True

# RECAPTCHA settings to use google captcha service in feedback form
RECAPTCHA_PUBLIC_KEY = '6Ldrbu4SAAAAALJ0NMX0LBK-UAE8u5wJT5zrb5Uo'
RECAPTCHA_PRIVATE_KEY = '6Ldrbu4SAAAAAPbt5g3Vw2BA_LGL1-BZwaBSsnfz'
RECAPTCHA_USE_SSL = False
CAPTCHA_AJAX = True

# TEMP EMAIL CONFIG
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

FEEDBACK_FORM_CATEGORIES = {
    'en': (('obs', 'Obstacle'),
           ('sign', 'Sign'),
           ('markers', 'Markers'),
           ('other', 'Other')),
    'fr': (('obs', 'Obstacle'),
           ('sign', 'Signalétique'),
           ('markers', 'Marquage'),
           ('other', 'Autre')),
}
# END FEEDBACK APP CONFIG PART
###
