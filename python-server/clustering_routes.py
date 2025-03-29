from flask import Flask, jsonify, request
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np
import pymongo
from bson.objectid import ObjectId
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import os
from dotenv import load_dotenv

load_dotenv()
mongo_url = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")

client = pymongo.MongoClient(mongo_url)
db = client[db_name]
users_collection = db["users"]


def get_unique_values():
    learning_styles = set()
    preferred_difficulties = set()
    domain_interests = set()

    for user in users_collection.find({}):
        lp = user.get("learningParameters", {})

        ls = lp.get("learningStyle")
        if ls:
            learning_styles.add(ls.lower())

        pd = lp.get("preferredDifficulty")
        if pd:
            preferred_difficulties.add(pd.lower())

        domains = lp.get("domainInterest", [])
        for domain in domains:
            domain_interests.add(domain.lower())

    return {
        "learning_styles": sorted(list(learning_styles)),
        "preferred_difficulties": sorted(list(preferred_difficulties)),
        "domain_interests": sorted(list(domain_interests)),
    }


def encode_user(lp, survey_params, LS_LIST, DIFF_LIST, DOMAIN_LIST):
    learning_style = lp.get("learningStyle", "").lower()
    ls_vec = [1 if learning_style == style else 0 for style in LS_LIST]

    tc = float(lp.get("timeCommitment", 0))

    preferred_diff = lp.get("preferredDifficulty", "").lower()
    pd_vec = [1 if preferred_diff == diff else 0 for diff in DIFF_LIST]

    user_domains = [d.lower() for d in lp.get("domainInterest", [])]
    di_vec = [1 if domain in user_domains else 0 for domain in DOMAIN_LIST]

    survey_vec = [
        survey_params.get("visualLearning", 0),
        survey_params.get("auditoryLearning", 0),
        survey_params.get("readingWritingLearning", 0),
        survey_params.get("kinestheticLearning", 0),
        survey_params.get("challengeTolerance", 0),
        survey_params.get("timeCommitment", 0),
        survey_params.get("learningPace", 0),
        survey_params.get("socialPreference", 0),
        survey_params.get("feedbackPreference", 0),
    ]

    return ls_vec + [tc] + pd_vec + di_vec + survey_vec


def get_cluster_summary(cluster_data):
    learning_styles = cluster_data.get("learning_styles", {})
    if learning_styles:
        predominant_ls = max(learning_styles, key=learning_styles.get)
    else:
        predominant_ls = "N/A"

    difficulties = cluster_data.get("preferred_difficulty", {})
    if difficulties:
        predominant_diff = max(difficulties, key=difficulties.get)
    else:
        predominant_diff = "N/A"

    domains = cluster_data.get("domain_interest", [])
    domain_str = ", ".join(domains) if domains else "N/A"

    avg_quiz_score = cluster_data.get("avg_quiz_score", "N/A")

    survey_summary = cluster_data.get("survey_summary", {})
    survey_str = (
        ", ".join([f"{k}: {v}" for k, v in survey_summary.items()])
        if survey_summary
        else "N/A"
    )

    summary = (
        f"Users in this cluster predominantly prefer a {predominant_ls} learning style, "
        f"and they tend to engage best with {predominant_diff} difficulty content. "
        f"Common domain interests include: {domain_str}. "
    )
    if avg_quiz_score != 0:
        summary += (
            f"On average, their quiz scores are around {avg_quiz_score} out of 10. "
        )
    else:
        summary += "No one in this cluster has taken a quiz yet. So, we may say that they like to learn but not to test. "

    summary += f"Survey parameters: {survey_str}. Significance of Survey Parameters (Scale: 0–5, where 0 = low, 5 = high): visualLearning: Preference for visual aids (e.g., diagrams, videos). High values (4–5) indicate reliance on visuals; low (0–1) suggests minimal visual dependency. auditoryLearning: Preference for listening-based learning (e.g., podcasts). High = auditory-focused; low = less reliance on sound. readingWritingLearning: Preference for text-based learning (e.g., articles). High = thrives on reading/writing; low = avoids textual engagement. kinestheticLearning: Preference for hands-on activities (e.g., labs). High = learns by doing; low = prefers passive methods. challengeTolerance: Comfort with difficult tasks. High = resilient to challenges; low = avoids complexity. timeCommitment: Availability for learning. High = dedicated time investment; low = limited availability. learningPace: Speed of learning. High = fast-paced; low = prefers gradual progress. socialPreference: Preference for group work. High = collaborative; low = solitary. feedbackPreference: Desire for guidance. High = values frequent feedback; low = minimal feedback needs."

    return summary


def aggregate_cluster_data(cluster_labels, user_ids):
    cluster_data = {
        i: {
            "learning_styles": {},
            "preferred_difficulty": {},
            "domain_interest": set(),
            "avg_quiz_score": 0.0,
            "survey_summary": {
                "visualLearning": 0.0,
                "auditoryLearning": 0.0,
                "readingWritingLearning": 0.0,
                "kinestheticLearning": 0.0,
                "challengeTolerance": 0.0,
                "timeCommitment": 0.0,
                "learningPace": 0.0,
                "socialPreference": 0.0,
                "feedbackPreference": 0.0,
            },
        }
        for i in range(5)
    }

    for uid, label in zip(user_ids, cluster_labels):
        user = users_collection.find_one({"_id": uid})
        if not user:
            print(f"User {uid} not found. Skipping...")
            continue

        lp = user.get("learningParameters", {})
        survey_params = user.get("surveyParameters", {})

        learning_style = lp.get("learningStyle", "").lower()
        if learning_style:
            cluster_data[label]["learning_styles"][learning_style] = (
                cluster_data[label]["learning_styles"].get(learning_style, 0) + 1
            )

        preferred_diff = lp.get("preferredDifficulty", "").lower()
        if preferred_diff:
            cluster_data[label]["preferred_difficulty"][preferred_diff] = (
                cluster_data[label]["preferred_difficulty"].get(preferred_diff, 0) + 1
            )

        domains = [d.lower() for d in lp.get("domainInterest", [])]
        cluster_data[label]["domain_interest"].update(domains)

        cluster_data[label]["avg_quiz_score"] += user.get("avg_quiz_score", 0)

        for key in cluster_data[label]["survey_summary"]:
            value = float(survey_params.get(key, 0))
            cluster_data[label]["survey_summary"][key] += value

    for label in cluster_data:
        count = cluster_labels.tolist().count(label)
        if count > 0:
            cluster_data[label]["avg_quiz_score"] = round(
                cluster_data[label]["avg_quiz_score"] / count, 2
            )

            for key in cluster_data[label]["survey_summary"]:
                cluster_data[label]["survey_summary"][key] = round(
                    cluster_data[label]["survey_summary"][key] / count, 2
                )

    return cluster_data


def index():
    return "<h1>Welcome to clustering api loosers</h1>"


def cluster_users():
    users = list(users_collection.find({}))
    if not users:
        return jsonify({"error": "No users found"}), 404

    unique_values = get_unique_values()
    LS_LIST = unique_values["learning_styles"]
    DIFF_LIST = unique_values["preferred_difficulties"]
    DOMAIN_LIST = unique_values["domain_interests"]

    features = []
    user_ids = []

    for user in users:
        lp = user.get("learningParameters", {})
        survey_params = user.get("surveyParameters", {})
        feature_vector = encode_user(lp, survey_params, LS_LIST, DIFF_LIST, DOMAIN_LIST)
        features.append(feature_vector)
        user_ids.append(user["_id"])

    features = np.array(features)

    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=5, random_state=42)
    cluster_labels = kmeans.fit_predict(features_scaled)

    pca = PCA(n_components=2)
    features_2d = pca.fit_transform(features_scaled)

    plt.figure(figsize=(10, 7))
    scatter = plt.scatter(
        features_2d[:, 0], features_2d[:, 1], c=cluster_labels, cmap="viridis"
    )

    legend1 = plt.legend(*scatter.legend_elements(), title="Clusters")
    plt.gca().add_artist(legend1)

    plt.title("User Clusters")
    plt.xlabel("PCA Component 1")
    plt.ylabel("PCA Component 2")
    plt.grid(True)

    plt.savefig(
        "static/cluster_plot.png"
    )
    plt.close()

    for uid, label in zip(user_ids, cluster_labels):
        users_collection.update_one(
            {"_id": ObjectId(uid)}, {"$set": {"clusterId": int(label)}}
        )

    cluster_data = aggregate_cluster_data(cluster_labels, user_ids)
    cluster_summaries = {
        str(label): {"id": int(label), "summary": get_cluster_summary(data)}
        for label, data in cluster_data.items()
    }

    cluster_summary_doc = {"id": "cluster_summary", "summaries": cluster_summaries}

    db["cluster_summaries"].update_one(
        {"id": "cluster_summary"}, {"$set": cluster_summary_doc}, upsert=True
    )

    return jsonify(
        {
            "message": "Users clustered successfully",
            "clusterAssignments": {
                str(uid): int(label) for uid, label in zip(user_ids, cluster_labels)
            },
            "clusterSummaries": cluster_summaries,
        }
    )


def cluster_summary():
    id = request.args.get("id")

    if id is None:
        return jsonify({"error": "Cluster ID not provided"}), 400

    cluster_summary = db["cluster_summaries"].find_one({"id": "cluster_summary"})
    if cluster_summary is None:
        return jsonify({"error": "Cluster summaries not found"}), 404

    summaries = cluster_summary.get("summaries", {})
    print("summaries", summaries)
    summary = summaries.get(id)

    if summary is None:
        return jsonify({"error": "Cluster summary not found"}), 404

    return jsonify(summary)