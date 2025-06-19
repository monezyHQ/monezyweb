# News Summary API Documentation

This document describes the API endpoints used for news summarization and approval in the Monezy application.

## Base URL

```
https://api.monezy.in/api/v1
```

## Authentication

All API requests require an API token to be included in the Authorization header:

```
Authorization: YOUR_API_TOKEN
```

## Endpoints

### 1. Generate Summary

Generates summaries for a given news article URL.

**Endpoint:** `/summarize`

**Method:** POST

**Request Headers:**
```
Authorization: YOUR_API_TOKEN
Accept: application/json
Content-Type: application/json
```

**Request Body:**
```json
{
    "url": "https://example.com/news-article",
    "language": "EN"  // "EN" for English, "HI" for Hindi
}
```

**Response:**
```json
{
    "id": "unique_id",
    "article_title": "Original Article Title",
    "summaries": [
        {
            "version": "v1",
            "title": "Generated Title 1",
            "summary": "Generated Summary 1"
        },
        {
            "version": "v2",
            "title": "Generated Title 2",
            "summary": "Generated Summary 2"
        },
        {
            "version": "v3",
            "title": "Generated Title 3",
            "summary": "Generated Summary 3"
        }
    ]
}
```

### 2. Approve News

Approves a generated summary with additional metadata and optional image.

**Endpoint:** `/approve`

**Method:** POST

**Request Headers:**
```
Authorization: YOUR_API_TOKEN
Accept: application/json
Content-Type: application/json
```

**Request Body:**
```json
{
    "id": "unique_id",
    "gen_title": "Selected Generated Title",
    "summary": "Selected Summary Text",
    "tag": "Markets|Stocks|IPO|Crypto",
    "label": "Factual|Opinion|Analysis|Exclusive|Breaking",
    "news_provider": "Provider Name",
    "news_datetime": 1624012800,  // Unix timestamp in seconds
    "selected_ver": "v1",  // Selected version (v1, v2, v3)
    "image_data": "base64_encoded_image_data"  // Optional, base64 encoded image without prefix
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Content approved successfully"
}
```

## Image Upload Guidelines

1. Supported image formats: JPEG, PNG
2. Maximum original image dimensions: 1200x1200 pixels
3. Images are automatically compressed with the following settings:
   - Quality: 80%
   - Format: JPEG
   - Max dimensions: 1200x1200 pixels (preserving aspect ratio)
4. Maximum file size after compression: 1MB

## Error Responses

The API may return the following error status codes:

- 400: Bad Request - Invalid parameters or missing required fields
- 401: Unauthorized - Invalid or missing API token
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side error

Error response format:
```json
{
    "error": "Error message description"
}
```
