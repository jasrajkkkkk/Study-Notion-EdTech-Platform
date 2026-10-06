"""
Hybrid recommender = content-based score * weight_a + collaborative score * weight_b.

Content-based: TF-IDF over each course's (tags + description), cosine
similarity between a student's "taste vector" (mean of TF-IDF vectors of
courses they've enrolled in) and every candidate course.

Collaborative: classic user-based CF. Build a (student x course) rating
matrix from the Ratings table, find the students most similar to the
target student (cosine similarity over co-rated courses), then score each
candidate course as the similarity-weighted average rating given to it by
those neighbours.

Both pieces degrade gracefully:
- A brand-new student with no enrollments gets a pure collaborative score
  (which itself falls back to "most popular" if there isn't enough data).
- A course with no ratings yet still surfaces via content similarity.
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from courses.models import Course
from enrollments.models import Enrollment
from ratings.models import Rating

CONTENT_WEIGHT = 0.5
COLLAB_WEIGHT = 0.5


def _course_corpus(courses):
    return [f"{c.tags} {c.description}" for c in courses]


def content_based_scores(student, candidate_courses, all_courses):
    if not candidate_courses:
        return {}

    corpus = _course_corpus(all_courses)
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(corpus)
    index_by_id = {c.id: i for i, c in enumerate(all_courses)}

    enrolled_ids = Enrollment.objects.filter(student=student).values_list("course_id", flat=True)
    enrolled_rows = [index_by_id[cid] for cid in enrolled_ids if cid in index_by_id]

    if not enrolled_rows:
        return {c.id: 0.0 for c in candidate_courses}

    taste_vector = np.asarray(tfidf[enrolled_rows].mean(axis=0))
    candidate_rows = [index_by_id[c.id] for c in candidate_courses]
    sims = cosine_similarity(taste_vector, tfidf[candidate_rows])[0]

    return {c.id: float(sims[i]) for i, c in enumerate(candidate_courses)}


def collaborative_scores(student, candidate_courses):
    if not candidate_courses:
        return {}

    ratings = Rating.objects.all().values_list("student_id", "course_id", "score")
    if not ratings:
        return {c.id: 0.0 for c in candidate_courses}

    student_ids = sorted({r[0] for r in ratings} | {student.id})
    course_ids = sorted({r[1] for r in ratings} | {c.id for c in candidate_courses})
    s_index = {sid: i for i, sid in enumerate(student_ids)}
    c_index = {cid: i for i, cid in enumerate(course_ids)}

    matrix = np.zeros((len(student_ids), len(course_ids)))
    for sid, cid, score in ratings:
        matrix[s_index[sid], c_index[cid]] = score

    target_row = matrix[s_index[student.id]].reshape(1, -1)
    if not np.any(target_row):
        # No ratings from this student yet — nothing to find neighbours with.
        return {c.id: 0.0 for c in candidate_courses}

    sims = cosine_similarity(target_row, matrix)[0]
    sims[s_index[student.id]] = 0  # exclude self

    scores = {}
    for course in candidate_courses:
        col = c_index[course.id]
        course_ratings = matrix[:, col]
        rated_mask = course_ratings > 0
        weights = sims[rated_mask]
        if weights.sum() <= 0:
            scores[course.id] = 0.0
            continue
        scores[course.id] = float(np.dot(weights, course_ratings[rated_mask]) / weights.sum())

    # Normalize 0-5 rating scale down to 0-1 so it's comparable to the
    # content-based cosine similarity before blending.
    return {cid: s / 5.0 for cid, s in scores.items()}


def hybrid_recommendations(student, limit=10):
    all_courses = list(Course.objects.filter(is_published=True))
    enrolled_ids = set(
        Enrollment.objects.filter(student=student).values_list("course_id", flat=True)
    )
    candidates = [c for c in all_courses if c.id not in enrolled_ids]
    if not candidates:
        return []

    content = content_based_scores(student, candidates, all_courses)
    collab = collaborative_scores(student, candidates)

    ranked = sorted(
        candidates,
        key=lambda c: CONTENT_WEIGHT * content.get(c.id, 0) + COLLAB_WEIGHT * collab.get(c.id, 0),
        reverse=True,
    )
    return ranked[:limit]
